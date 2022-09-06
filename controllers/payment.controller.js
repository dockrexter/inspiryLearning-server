const db = require("../models");
const paypal = require("paypal-rest-sdk");
const response = require("../utils/response");
const {
  getUserRole,
  sendFcmMessage,
  getAllAdminTokens,
  getTokensByUserId,
} = require("../utils/utils");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "ATvP70Gwt-cjnGs3hBKCmts_81KNb8H6eGSz2YQSN2jDLdL7-Y-Fh7rDmmkEYPzd6RmZdM6W8PfOJD36",
  client_secret:
    "EOXlEENgOKkkPqNAWoZwPrLCVehKLzXTdbulyqCRluMV7zXW9GRE4DkbBbMBvTSNKUmNP7hO3jtgld-h",
});

const initiatePayment = (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal",
    },
    redirect_urls: {
      return_url:
        "http://192.168.100.125:8000/api/payment/success?assignmentId=" +
        req.body.assignmentId +
        "&messageId=" +
        req.body.messageId,
      cancel_url:
        "http://192.168.100.125:8000/api/payment/cancel",
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: req.body.itemName,
              sku: "001",
              price: req.body.price,
              currency: req.body.currency,
              quantity: 1,
            },
          ],
        },
        amount: {
          currency: req.body.currency,
          total: req.body.price,
        },
        description: req.body.description,
      },
    ],
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      return res.status(401).json(
        response(
          401,
          "error",
          "An error has occured while processing the request",
          {
            error,
          }
        )
      );
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          return res.status(200).json(
            response(200, "ok", "Here is your payment URL", {
              url: payment.links[i].href,
            })
          );
        }
      }
    }
  });
};

const onSuccess = (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async (error, payment) => {
      if (error) {
        return res
          .status(401)
          .json(response(401, "error", "An error has occured", { error }));
      } else {
        await db.Chat.update(
          {
            paymentStatus: 1,
          },
          { where: { id: req.query.messageId } }
        );
        await db.Assignment.update(
          {
            paymentStatus: 1,
          },
          { where: { id: req.query.assignmentId } }
        );
        await addNotification(
          req.user.id,
          `Payment has been successfully made for ${req.query.assignmentId}`,
          "Payment status change",

          req.query.assignmentId
        );
        await sendFcmMessage(
          "Payment status change",
          `Payment has been successfully made for ${req.query.assignmentId}`,
          await getAllAdminTokens(),
          req.query.assignmentId
        );

        return res.end(`<html><head><link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,400i,700,900&display=swap" rel="stylesheet"></head><style> body {
        text-align: center;
        padding: 40px 0;
        background: #EBF0F5;
      } h1 {
          color: #88B04B;
          font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
          font-weight: 900;
          font-size: 40px;
          margin-bottom: 10px;
        } p {
          color: #404F5E;
          font-family: "Nunito Sans", "Helvetica Neue", sans-serif;
          font-size:20px;
          margin: 0;
        } i {
        color: #9ABC66;
        font-size: 100px;
        line-height: 200px;
        margin-left:-15px;
      }
      .card {
        background: white;
        padding: 60px;
        border-radius: 4px;
        box-shadow: 0 2px 3px #C8D0D8;
        display: inline-block;
        margin: 0 auto;
      }</style><body><div class="card"><div style="border-radius:200px; height:200px; width:200px; background: #F8FAF5; margin:0 auto;"><i class="checkmark">✓</i>
      </div><h1>Success</h1><p>Your payment received successfully</p></div></body></html>`);
      }
    }
  );
};

const onCancel = (req, res) =>
  res
    .status(200)
    .json(response(200, "ok", "Payment cancelled successfully", {}));

const rejectPayment = async (req, res) => {
  try {
    console.log("messageID=>", req.body.messageId);
    await db.Chat.update(
      {
        paymentStatus: 2,
      },
      { where: { id: req.body.messageId } }
    );
    const chat = await db.Chat.findByPk(req.body.messageId);

    console.log("chat object =>", chat);
    if (req.user.role == "user") {
      await addNotification(
        req.user.id,
        `Payment has been rejected for assignment ID: ${chat.assignmentId}`,
        "Payment status change",
        chat.assignmentId,
      );
    }
    else {
      var adminIds = await getAllAdminIds();
      for (const adminId of adminIds) {
        await addNotification(
          adminId,
          `Payment has been rejected for assignment ID: ${chat.assignmentId}`,
          "Payment status change",
          chat.assignmentId,
        );
      }
    }

    await sendFcmMessage(
      "Payment status change",
      `Payment has been rejected for assignment ID: ${chat.assignmentId}`,
      req.user.role == "user" ? await getAllAdminTokens() : await getTokensByUserId(chat.assignmentId),
      chat.assignmentId
    );
    return res
      .status(200)
      .json(response(200, "ok", "payment rejected successfully", {}));

  }
  catch (error) {
    return res
      .status(500)
      .json(response(500, "ok", "something went wrong", {}));

  }

};

module.exports = { initiatePayment, rejectPayment, onSuccess, onCancel };
