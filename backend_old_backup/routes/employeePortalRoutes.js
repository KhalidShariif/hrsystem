const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');

// @desc    Get current employee profile
// @route   GET /api/employee/me
// @access  Private (Employee only)
router.get('/me', protect, async (req, res) => {
  try {
    if (!req.user.employeeIdRef) {
      return res.status(404).json({ message: 'User not linked to an employee record' });
    }
    const employee = await Employee.findById(req.user.employeeIdRef).populate('department');
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get current employee attendance history
// @route   GET /api/employee/me/attendance
// @access  Private (Employee only)
router.get('/me/attendance', protect, async (req, res) => {
  try {
    if (!req.user.employeeIdRef) {
      return res.status(404).json({ message: 'User not linked to an employee record' });
    }
    const attendance = await Attendance.find({ employee: req.user.employeeIdRef }).sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Change employee password
// @route   PUT /api/employee/me/password
// @access  Private (Employee only)
router.put('/me/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update notification settings
// @route   PUT /api/employee/me/notifications
// @access  Private (Employee only)
router.put('/me/notifications', protect, async (req, res) => {
  try {
    if (!req.user.employeeIdRef) {
      return res.status(404).json({ message: 'User not linked to an employee record' });
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.user.employeeIdRef,
      { notificationSettings: req.body },
      { new: true }
    );
    
    res.json(employee.notificationSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
