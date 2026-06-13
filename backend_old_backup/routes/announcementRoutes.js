const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Announcement = require('../models/Announcement');
const Employee = require('../models/Employee');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Private (Admin/HR)
router.post('/', protect, authorize('admin', 'hr_manager'), async (req, res) => {
  try {
    const { title, message, targetType, targetValue } = req.body;
    const announcement = await Announcement.create({
      title,
      message,
      targetType,
      targetValue,
      createdBy: req.user._id
    });
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get announcements for current user
// @route   GET /api/announcements
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = { targetType: 'all' };

    if (req.user.role === 'employee') {
      const employee = await Employee.findById(req.user.employeeIdRef).populate('department');
      if (employee) {
        query = {
          $or: [
            { targetType: 'all' },
            { targetType: 'branch', targetValue: employee.hub },
            { targetType: 'department', targetValue: employee.department?.name }
          ]
        };
      }
    } else {
      // Admin and HR see all announcements
      query = {};
    }

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
