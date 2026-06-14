const Joi = require("joi");

const createEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().trim().max(50).allow(null, ""),
  designation: Joi.string().trim().max(150).allow(null, ""),
  department_id: Joi.number().integer().positive().allow(null),
  date_of_joining: Joi.date().iso().allow(null),
  skill_ids: Joi.alternatives().try(Joi.array().items(Joi.number().integer().positive()), Joi.string()),
});

const updateEmployeeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().trim().max(50).allow(null, "").optional(),
  designation: Joi.string().trim().max(150).allow(null, "").optional(),
  department_id: Joi.number().integer().positive().allow(null).optional(),
  date_of_joining: Joi.date().iso().allow(null).optional(),
  skill_ids: Joi.alternatives().try(Joi.array().items(Joi.number().integer().positive()), Joi.string()).optional(),
});

module.exports = { createEmployeeSchema, updateEmployeeSchema };
