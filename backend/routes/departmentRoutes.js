const express = require('express');
const router = express.Router();
const { getDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('admin', 'hr_manager'), createDepartment);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorize('admin', 'hr_manager'), updateDepartment)
  .delete(protect, authorize('admin', 'hr_manager'), deleteDepartment);

module.exports = router;
