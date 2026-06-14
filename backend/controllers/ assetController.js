const assetService = require("../services/assetService");

exports.getAssets = async (req, res, next) => {
  try {
    const { limit, offset, sortBy, order, type } = req.query;
    const assets = await assetService.getAssets({ limit, offset, sortBy, order, type });
    res.json(assets);
  } catch (error) {
    next(error);
  }
};

exports.createAsset = async (req, res, next) => {
  try {
    const asset = await assetService.createAsset(req.body, req.user?.id);
    res.status(201).json(asset);
  } catch (error) {
    next(error);
  }
};

exports.allocateAsset = async (req, res, next) => {
  try {
    const { assetId, employeeId, notes } = req.body;
    const allocation = await assetService.allocateAsset(assetId, employeeId, notes, req.user?.id);
    res.json({ message: "Asset allocated successfully", data: allocation });
  } catch (error) {
    next(error);
  }
};

exports.returnAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const result = await assetService.returnAsset(assetId, req.user?.id);
    res.json({ message: "Asset returned successfully", data: result });
  } catch (error) {
    next(error);
  }
};