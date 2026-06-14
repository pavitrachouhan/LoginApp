const pool = require("../config/db");
const assetRepository = require("./assetRepository");
const auditService = require("./auditService");
const notificationService = require("./notificationService");

const getAssets = (filters) => assetRepository.findAll(filters);

const createAsset = async (data, userId) => {
  const asset = await assetRepository.create(data);
  await auditService.logChange('assets', asset.id, 'INSERT', null, asset, userId);
  return asset;
};

const getEmployeeUserId = async (employeeId) => {
  const result = await pool.query("SELECT user_id FROM employees WHERE id = $1", [employeeId]);
  return result.rows[0]?.user_id || null;
};

const allocateAsset = async (assetId, employeeId, notes, userId) => {
  const asset = await assetRepository.findById(assetId);
  if (!asset || asset.status !== 'available') {
    throw new Error("Asset is not available for allocation");
  }

  const allocation = await assetRepository.allocateAsset(assetId, employeeId, notes);
  
  await auditService.logChange(
    'asset_allocations', 
    allocation.id, 
    'ALLOCATE', 
    { status: 'available' }, 
    { status: 'allocated', employee_id: employeeId }, 
    userId
  );

  const employeeUserId = await getEmployeeUserId(employeeId);
  if (employeeUserId) {
    await notificationService.createNotification(employeeUserId, `New asset assigned: ${asset.asset_name}.`);
  }

  return allocation;
};

const returnAsset = async (assetId, userId) => {
  const asset = await assetRepository.findById(assetId);
  if (!asset || asset.status !== 'allocated') {
    throw new Error("Asset is not currently allocated and cannot be returned.");
  }

  const allocation = await assetRepository.returnAsset(assetId);
  
  await auditService.logChange(
    'asset_allocations',
    allocation.id,
    'RETURN',
    { status: 'allocated' },
    { status: 'available' },
    userId
  );
  return allocation;
};

module.exports = { getAssets, createAsset, allocateAsset, returnAsset };