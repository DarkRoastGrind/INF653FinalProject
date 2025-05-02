const Employee = require("../model/Employee");

const getAllEmployees = async (req, res) => {
  const employees = await Employee.find();
  if (!employees)
    return res.status(204).json({ message: "No Employees found." }); // No content response
  res.json(employees);
};

const createNewEmployee = async (req, res) => {
  // If there isn't a firstname or lastname in the body,
  if (!req?.body?.firstname || !req?.body?.lastname) {
    return res
      .status(400)
      .json({ message: "First and last names are required." });
  }

  try {
    const result = await Employee.create({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
    });

    res.status(201).json(result);
  } catch (err) {
    console.log(err);
  }
};

const updateEmployee = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: `ID parameter is required.` });
  }

  const employee = await Employee.findOne({
    _id: req.body.id,
  }).exec();

  // If employee isn't found/bad content request.
  if (!employee) {
    return res
      .status(204) // Requested content that does not exist.
      .json({ message: `No employee found with ID ${req.body.id}.` });
  }

  if (req.body?.firstname) employee.firstname = req.body.firstname;
  if (req.body?.lastname) employee.lastname = req.body.lastname;

  const result = await employee.save();

  res.json(result);
};

const deleteEmployee = async (req, res) => {
  if (!req?.body?.id) {
    return res.status(400).json({ message: "Employee ID required." });
  }

  // Set eployee to the corret employee using the id provided.
  const employee = await Employee.findOne({
    _id: req.body.id,
  }).exec();

  // If employee isn't found/bad content request.
  if (!employee) {
    return res
      .status(204) // Requested content that does not exist.
      .json({ message: `No employee found with ID ${req.body.id}.` });
  }

  // Delete the employee
  const result = await employee.deleteOne({ _id: req.body.id });

  res.json(result);
};

const getEmployee = async (req, res) => {
  if (!req?.params?.id) {
    return res.status(400).json({ message: "Employee ID required." });
  }

  const employee = await Employee.findOne({
    _id: req.params.id,
  }).exec();

  // If employee isn't found/bad content request.
  if (!employee) {
    return res
      .status(204) // Requested content that does not exist.
      .json({ message: `No employee found with ID ${req.params.id}.` });
  }

  res.json(employee);
};

module.exports = {
  getAllEmployees,
  createNewEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
};
