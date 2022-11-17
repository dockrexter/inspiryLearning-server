require("dotenv").config;
const db = require("../models");
const moment = require("moment");
const response = require("../utils/response");
const { Op } = (Sequelize = require("sequelize"));
const {
  getAllAdminIds,
  sendFcmMessage,
  addNotification,
  getAllAdminTokens,
  getTokensByUserId,
  getUserIdByAssignmentId
} = require("../utils/utils");

/**
 * Buisness logic
 */

const status = {
  3: "Under Review",
  4: "Pending Payment",
  1: "Work in Progress",
  0: "Work Completed",
}

const getUserAssignments = async (req, res) => {
  try {
    const assignments = await db.Assignment.findAll({
      where: { userId: req.user.id },
    });
    return res.status(200).json(response(200, "ok", "Successfull", assignments));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something went wrong"));
  }
};

const deleteAssignment = async (req,res) =>{
  try {
    const {id} = req.body;
    const assignment = await db.Assignment.destroy({ where: { id: id } });
    return res.status(200).json(response(200, "ok", "Delete Successfull", assignment));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something went wrong"));
  }
}
const tableSync = async(req, res) => {
  try {
    const sync = await db.Assignment.sync({force: true});
    res.status(208).json(response(208, "ok", "Sync Successfull", sync))
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something went wrong"));
  }
}

const getAssignmentById = async (req, res) => {
  try {
    const assignments = await db.Assignment.findOne({
      where: { id: req.body.assignment_id },
    });
    const user = await db.User.findOne({
      where:{id : assignments.userId}
    })
    const data = {assignments, user}
    return res.status(200).json(response(200, "ok", "Successfull by ID", data));
  }
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(response(500, "BAD REQUEST", "Something Went Wrong", {}));
  }
};

const getAttachments = async (req, res) => {
  try {
    const attachments = await db.Attachments.findAll({
      where: { assignmentId: req.body.assignment_id },
    });
    return res.status(200).json(response(200, "ok", "", attachments));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something went wrong"));
  }
};


const updateAssignee = async (req, res) => {
  try {
    await db.Assignment.update(
      {
        assignee: req.body.assignee,
      },
      { where: { id: req.body.assignment_id } }
    );
    return res
      .status(200)
      .json(response(200, "ok", "assignee updated successfully", {}));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something went wrong"));
  }
};

const updateStatus = async (req, res) => {
  try {
    await db.Assignment.update(
      {
        status: req.body.status,
      },
      { where: { id: req.body.assignment_id } }
    );
    const userId = await getUserIdByAssignmentId(req.body.assignment_id);
    await addNotification(
      userId,
      `Assignment status has been changed to ${status[req.body.status]}`,
      "Assignment Status",
      req.body.assignment_id,
    );
    const fbtokenClient = await getTokensByUserId(req.body.assignment_id);
    if (fbtokenClient?.length) {
      await sendFcmMessage(
        "Assignment Status",
        `Assignment status has been changed to ${status[req.body.status]}`,
        fbtokenClient,
        req.body.assignment_id,
      );
    }
    return res
      .status(200)
      .json(response(200, "ok", "status updated successfully", {}));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Somthing Went Wrong"));
  }
};

const createUserAssignment = async (req, res) => {
  try {
    const assignment = await db.Assignment.create({
      status: 2,
      assignee: null,
      paymentStatus: 0,
      userId: req.user.id,
      subject: req.body.subject,
      summary: req.body.summary,
      deadline: moment.utc(req.body.deadline).toDate().toISOString(),
    });

    for (const file of req.files) {
      if (
        !(await db.Attachments.create({
          assignmentId: assignment.id,
          fileName: file.originalname,
          fileSize: file.size,
          url: `/${file.path.replace(/\\/g, "/")}`,
        }))
      )
        return res
          .status(400)
          .json(response(400, "error", "attachments not uploded", {}));
    }

    var adminIds = await getAllAdminIds();
    for (const adminId of adminIds) {
      await addNotification(
        adminId,
        `You Have New Assignment ${assignment.subject}`,
        "New Assignment",
        assignment.id,
      );
    }
    const fbtoken = await getAllAdminTokens()
    if (fbtoken?.length) {
      await sendFcmMessage(
        "New Assignment",
        `You Have New Assignment ${assignment.subject}`,
        fbtoken,
        assignment.id,
      ).catch((error) => {
        console.error(error);
      });
    }

    return res
      .status(200)
      .json(response(200, "ok", "assignment uploaded successfully", {}));
  } catch (error) {
    return res
      .status(500)
      .json(response(500, "error", "Something Went Wrong"));
  }
};

const getCurrentMonthAssignments = async (req, res) => {
  try {
    const { current_month, current_year } = req.body;

    const assignments = await db.Assignment.findAll({
      where: {
        deadline: {
          [Op.gte]: new Date(`${current_year}-${current_month}-01`),
          [Op.lt]: new Date(`${current_year}-${parseInt(current_month) + 1}-01`),
        },
      },
    });

    return res.status(200).json(response(200, "ok", "", assignments));
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"))

  }
};

const getAllDueAssignments = async (req, res) => {
  try {
    const assignments = await db.Assignment.findAll({
      where: {
        deadline: {
          [Op.notLike]: `${req.body.current_date}%`,
        },
        status: {
          [Op.not]: 0,
        },
      },
    });
    return res.status(200).json(response(200, "ok", "", assignments));
  } catch (error) {
    return res.status(500).json(response(500, "error", "Something Went Wrong"));
  }
};

module.exports = {
  updateStatus,
  updateAssignee,
  getAttachments,
  getUserAssignments,
  getAllDueAssignments,
  createUserAssignment,
  getCurrentMonthAssignments,
  getAssignmentById,
  deleteAssignment,
  tableSync,
};
