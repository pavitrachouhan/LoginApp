const auditService = require("../services/auditService");

exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await auditService.getAuditLogs(req.query);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};
