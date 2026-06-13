const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getEmployees)
  .post(protect, authorize('admin', 'hr_manager'), createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, authorize('admin', 'hr_manager'), updateEmployee)
  .delete(protect, authorize('admin', 'hr_manager'), deleteEmployee);

module.exports = router;
