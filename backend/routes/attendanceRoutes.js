const express = require('express');
const router = express.Router();
const { getAttendances, getAttendanceById, createAttendance, updateAttendance, deleteAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAttendances)
  .post(protect, createAttendance);

router.route('/:id')
  .get(protect, getAttendanceById)
  .put(protect, authorize('admin', 'hr_manager'), updateAttendance)
  .delete(protect, authorize('admin', 'hr_manager'), deleteAttendance);

module.exports = router;
