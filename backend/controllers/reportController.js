const reportService = require("../services/reportService");

exports.getAssetAllocationReport = async (req, res, next) => {
  try {
    const report = await reportService.getAssetAllocationReport();
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getLeaveDashboardStats = async (req, res, next) => {
  try {
    const stats = await reportService.getLeaveDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeReport = async (req, res, next) => {
  try {
    const report = await reportService.getEmployeeReport(req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getLeaveReport = async (req, res, next) => {
  try {
    const report = await reportService.getLeaveReport(req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getAssetReport = async (req, res, next) => {
  try {
    const report = await reportService.getAssetReport(req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentAnalytics = async (req, res, next) => {
  try {
    const analytics = await reportService.getDepartmentAnalytics();
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

exports.exportEmployees = async (req, res, next) => {
  try {
    const csv = await reportService.getEmployeeCsv();
    res.header("Content-Type", "text/csv");
    res.attachment("employees-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

exports.exportLeaves = async (req, res, next) => {
  try {
    const csv = await reportService.getLeaveCsv();
    res.header("Content-Type", "text/csv");
    res.attachment("leaves-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

exports.exportAssets = async (req, res, next) => {
  try {
    const csv = await reportService.getAssetCsv();
    res.header("Content-Type", "text/csv");
    res.attachment("assets-report.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
