const express = require('express');
const router = express.Router();
const { getLeaves, getLeaveById, createLeave, updateLeave, deleteLeave } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getLeaves)
  .post(protect, createLeave);

router.route('/:id')
  .get(protect, getLeaveById)
  .put(protect, authorize('admin', 'hr_manager'), updateLeave)
  .delete(protect, authorize('admin', 'hr_manager'), deleteLeave);

module.exports = router;
