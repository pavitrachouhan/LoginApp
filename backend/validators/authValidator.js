const Joi = require("joi");

const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("employee", "manager", "hr", "admin").default("employee"),
});

const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
