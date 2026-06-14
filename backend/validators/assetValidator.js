const Joi = require("joi");

const createAssetSchema = Joi.object({
  asset_name: Joi.string().trim().min(2).max(200).required(),
  asset_type: Joi.string().trim().min(2).max(100).required(),
  asset_code: Joi.string().trim().min(2).max(100).required(),
});

const allocateAssetSchema = Joi.object({
  assetId: Joi.number().integer().positive().required(),
  employeeId: Joi.number().integer().positive().required(),
  notes: Joi.string().max(1000).allow(null, ""),
});

module.exports = { createAssetSchema, allocateAssetSchema };
