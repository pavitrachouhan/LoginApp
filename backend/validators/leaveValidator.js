const Joi = require("joi");

const applyLeaveSchema = Joi.object({
  leave_type_id: Joi.number().integer().positive().required(),
  from_date: Joi.date().iso().required(),
  to_date: Joi.date().iso().required(),
  total_days: Joi.number().positive().required(),
  reason: Joi.string().max(1000).allow(null, ""),
});

const reviewLeaveSchema = Joi.object({
  action: Joi.string().valid("APPROVE", "REJECT").required(),
  comment: Joi.string().max(1000).allow(null, ""),
});

module.exports = { applyLeaveSchema, reviewLeaveSchema };
