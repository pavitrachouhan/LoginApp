const employeeRepository = require("../repositories/employeeRepository");
const auditService = require("./auditService");
const ApiError = require("../utils/ApiError");

const parseSkillIds = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item) => Number(item)).filter(Boolean);
  if (typeof value === "string") {
    try {
      return JSON.parse(value).map((item) => Number(item)).filter(Boolean);
    } catch (error) {
      return value.split(",").map((item) => Number(item.trim())).filter(Boolean);
    }
  }
  return [];
};

const createEmployee = async (payload, files, userId) => {
  const employee = await employeeRepository.createEmployee({
    ...payload,
    profile_photo: files?.profile_photo?.[0]?.path || null,
    resume: files?.resume?.[0]?.path || null,
  });

  const skillIds = parseSkillIds(payload.skill_ids || payload.skills);
  await employeeRepository.addEmployeeSkills(employee.id, skillIds);

  const documents = (files?.documents || []).map((file) => ({
    document_name: file.originalname,
    document_path: file.path,
  }));
  await employeeRepository.addEmployeeDocuments(employee.id, documents);

  await auditService.logChange("employees", employee.id, "INSERT", null, employee, userId);
  return employee;
};

const getEmployees = async (filters) => employeeRepository.findAll(filters);

const getEmployeeById = async (employeeId) => {
  const employee = await employeeRepository.findById(employeeId);
  if (!employee) {
    throw ApiError.notFound("Employee not found.");
  }
  const documents = await employeeRepository.findDocumentsByEmployeeId(employeeId);
  return { ...employee, documents };
};

const updateEmployee = async (employeeId, payload, files, userId) => {
  const existing = await employeeRepository.findById(employeeId);
  if (!existing) {
    throw ApiError.notFound("Employee not found.");
  }

  const data = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    designation: payload.designation,
    department_id: payload.department_id || null,
    date_of_joining: payload.date_of_joining || null,
  };

  if (files?.profile_photo?.[0]?.path) {
    data.profile_photo = files.profile_photo[0].path;
  }
  if (files?.resume?.[0]?.path) {
    data.resume = files.resume[0].path;
  }

  const updated = await employeeRepository.updateEmployee(employeeId, data);

  const skillIds = parseSkillIds(payload.skill_ids || payload.skills);
  if (skillIds.length) {
    await employeeRepository.clearEmployeeSkills(employeeId);
    await employeeRepository.addEmployeeSkills(employeeId, skillIds);
  }

  const documents = (files?.documents || []).map((file) => ({
    document_name: file.originalname,
    document_path: file.path,
  }));
  await employeeRepository.addEmployeeDocuments(employeeId, documents);

  await auditService.logChange("employees", employeeId, "UPDATE", existing, updated, userId);
  return updated;
};

const deleteEmployee = async (employeeId, userId) => {
  const existing = await employeeRepository.findById(employeeId);
  if (!existing) {
    throw ApiError.notFound("Employee not found.");
  }

  await employeeRepository.deleteEmployee(employeeId);
  await auditService.logChange("employees", employeeId, "DELETE", existing, null, userId);
  return existing;
};

module.exports = { createEmployee, getEmployees, getEmployeeById, updateEmployee, deleteEmployee };
