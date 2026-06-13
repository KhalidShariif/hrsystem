const express = require('express');
const router = express.Router();
const { getPayrolls, getPayrollById, createPayroll, updatePayroll, deletePayroll, generatePayroll, getPayrollStats } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorize('admin', 'hr_manager'), generatePayroll);
router.get('/stats', protect, getPayrollStats);

router.route('/')
  .get(protect, getPayrolls)
  .post(protect, authorize('admin', 'hr_manager'), createPayroll);

router.route('/:id')
  .get(protect, getPayrollById)
  .put(protect, authorize('admin', 'hr_manager'), updatePayroll)
  .delete(protect, authorize('admin', 'hr_manager'), deletePayroll);

module.exports = router;
