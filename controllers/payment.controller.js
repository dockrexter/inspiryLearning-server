const path = require("path");
const paypal = require("paypal-rest-sdk");
const response = require("../utils/response");

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
        "https://inspirylearning-server.herokuapp.com/api/payment/success",
      cancel_url:
        "https://inspirylearning-server.herokuapp.com/api/payment/cancel",
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
    transactions: [
      {
        amount: {
          currency: "USD",
          total: "25.00",
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {
        return res.status(401).json(response(401, "error", "An error has occured", { error }));
      } else {
        return res.sendFile(
          path.join(__dirname, "../templates/payment_successfull.html")
        );
      }
    }
  );
};

const onCancel = (req, res) =>
  res
    .status(200)
    .json(
      response(200, "Payment cancelled", "Payment cancelled successfully", {})
    );

module.exports = { initiatePayment, onSuccess, onCancel };
