const ApiError = require("../utils/ApiError");

const validateRequest = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, allowUnknown: false });
  if (error) {
    const details = error.details.map((detail) => detail.message);
    return next(ApiError.badRequest("Validation error", details));
  }

  req.body = value;
  next();
};

module.exports = validateRequest;
