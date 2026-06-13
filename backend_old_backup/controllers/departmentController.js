const Department = require('../models/Department');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName email');
    res.json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName email');
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const department = new Department(req.body);
    const createdDepartment = await department.save();
    res.status(201).json(createdDepartment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (department) {
      await department.deleteOne();
      res.json({ message: 'Department removed' });
    } else {
      res.status(404).json({ message: 'Department not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
