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
  getTokensByUserId
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
  const assignments = await db.Assignment.findAll({
    where: { userId: req.user.id },
  });
  return res.status(200).json(response(200, "ok", "", assignments));
};

const getAttachments = async (req, res) => {
  const attachments = await db.Attachments.findAll({
    where: { assignmentId: req.body.assignment_id },
  });
  return res.status(200).json(response(200, "ok", "", attachments));
};

const updateAssignee = async (req, res) => {
  await db.Assignment.update(
    {
      assignee: req.body.assignee,
    },
    { where: { id: req.body.assignment_id } }
  );
  return res
    .status(200)
    .json(response(200, "ok", "assignee updated successfully", {}));
};

const updateStatus = async (req, res) => {
  await db.Assignment.update(
    {
      status: req.body.status,
    },
    { where: { id: req.body.assignment_id } }
  );
  await sendFcmMessage(
    "Assignment Status",
    `Assignment status has been changed to ${status[req.body.status]}`,
    await getTokensByUserId(req.body.assignment_id),
    req.body.assignment_id,
  );
  return res
    .status(200)
    .json(response(200, "ok", "status updated successfully", {}));
};

const createUserAssignment = async (req, res) => {
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
      `You Have New Assignment ${assignment.subject} on ${assignment.deadline}`,
      "New Assignment",
      assignment.id,
    );
  }

  await sendFcmMessage(
    "New Assignment",
    `You Have New Assignment ${assignment.subject} on ${assignment.deadline}`,
    await getAllAdminTokens(),
    assignment.id,
  );

  return res
    .status(200)
    .json(response(200, "ok", "assignment uploaded successfully", {}));
};

const getCurrentMonthAssignments = async (req, res) => {
  const { current_month, current_year } = req.body;
  console.log(`${current_year}-${current_month + 1}-01`)

  const assignments = await db.Assignment.findAll({
    where: {
      deadline: {
        [Op.gte]: new Date(`${current_year}-${current_month}-01`),
        [Op.lt]: new Date(`${current_year}-${parseInt(current_month) + 1}-01`),
      },
    },
  });

  return res.status(200).json(response(200, "ok", "", assignments));
};

const getAllDueAssignments = async (req, res) => {
  console.log(new Date(req.body.current_date));
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
};

module.exports = {
  updateStatus,
  updateAssignee,
  getAttachments,
  getUserAssignments,
  getAllDueAssignments,
  createUserAssignment,
  getCurrentMonthAssignments,
};
