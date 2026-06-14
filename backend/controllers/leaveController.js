const leaveService = require("../services/leaveService");

const getLeaveTypes = async (req, res, next) => {
  try {
    const leaveTypes = await leaveService.getLeaveTypes();
    res.status(200).json(leaveTypes);
  } catch (error) {
    next(error);
  }
};

const applyLeave = async (req, res, next) => {
  try {
    const leave = await leaveService.applyLeave(req.body, req.user);
    res.status(201).json({ message: "Leave applied successfully", data: leave });
  } catch (error) {
    next(error);
  }
};

const listLeaves = async (req, res, next) => {
  try {
    const leaves = await leaveService.getLeaveRequests(req.user);
    res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

const getLeaveById = async (req, res, next) => {
  try {
    const leave = await leaveService.getLeaveById(Number(req.params.id), req.user);
    res.status(200).json(leave);
  } catch (error) {
    next(error);
  }
};

const getLeaveBalance = async (req, res, next) => {
  try {
    const employeeId = Number(req.params.employeeId);
    const balance = await leaveService.getLeaveBalance(employeeId, req.user);
    res.status(200).json(balance);
  } catch (error) {
    next(error);
  }
};

const managerReview = async (req, res, next) => {
  try {
    const review = await leaveService.processManagerReview(Number(req.params.id), req.body, req.user);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

const hrReview = async (req, res, next) => {
  try {
    const review = await leaveService.processHRReview(Number(req.params.id), req.body, req.user);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

const getApprovalHistory = async (req, res, next) => {
  try {
    const history = await leaveService.getApprovalHistory(Number(req.params.id), req.user);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
};

const getLeaveAnalytics = async (req, res, next) => {
  try {
    const analytics = await leaveService.getLeaveAnalytics();
    res.status(200).json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaveTypes,
  applyLeave,
  listLeaves,
  getLeaveById,
  getLeaveBalance,
  managerReview,
  hrReview,
  getApprovalHistory,
  getLeaveAnalytics,
};
