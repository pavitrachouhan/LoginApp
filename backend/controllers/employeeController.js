const employeeService = require("../services/employeeService");

exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.body, req.files, req.user?.userId);
    res.status(201).json({ message: "Employee created successfully.", employee });
  } catch (error) {
    next(error);
  }
};

exports.listEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.getEmployees(req.query);
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(Number(req.params.id));
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(Number(req.params.id), req.body, req.files, req.user?.userId);
    res.json({ message: "Employee updated successfully.", employee });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(Number(req.params.id), req.user?.userId);
    res.json({ message: "Employee deleted successfully." });
  } catch (error) {
    next(error);
  }
};
