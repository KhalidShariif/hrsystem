const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

const getLeaves = async (req, res, next) => {
  try {
    let leaves = await Leave.find()
      .populate('employee', 'firstName lastName employeeId email department position hub district')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // HR manager restriction: Only see leaves in assigned hub/district
    if (req.user.role === 'hr_manager') {
      leaves = leaves.filter(l => {
        const matchesHub = l.employee?.hub === req.user.region;
        const matchesDistrict = !req.user.district || l.employee?.district === req.user.district;
        return matchesHub && matchesDistrict;
      });
    }

    res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getLeaveById = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id).populate({ path: 'employee', select: 'firstName lastName employeeId position', populate: { path: 'department', select: 'name' } }).populate('approvedBy', 'firstName lastName');
    if (leave) {
      res.json(leave);
    } else {
      res.status(404).json({ message: 'Leave not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createLeave = async (req, res, next) => {
  try {
    const leave = new Leave(req.body);
    const createdLeave = await leave.save();

    // Trigger notification
    try {
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(createdLeave.employee);
      const Notification = require('../models/Notification');
      await Notification.create({
        title: 'New Leave Request',
        message: `${employee ? employee.firstName + ' ' + employee.lastName : 'An employee'} has submitted a ${createdLeave.leaveType} leave request.`,
        type: 'leave',
        targetRole: 'admin',
        referenceId: createdLeave._id
      });
    } catch (notifErr) {
      console.error('Failed to create notification:', notifErr);
    }

    res.status(201).json(createdLeave);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (leave) {
      if (req.body.status === 'approved') {
        const { startDate, endDate, employee, leaveType, reason } = leave;
        let curr = new Date(startDate);
        const end = new Date(endDate);
        
        while (curr <= end) {
          const dateStr = curr.toISOString().split('T')[0];
          const startOfDay = new Date(dateStr);
          startOfDay.setHours(0, 0, 0, 0);
          
          try {
            const startOfDay = new Date(curr);
            startOfDay.setHours(0, 0, 0, 0);
            
            const exists = await Attendance.findOne({ 
              employee: employee._id || employee, 
              date: startOfDay 
            });
            
            if (!exists) {
              await Attendance.create({
                employee: employee._id || employee,
                date: startOfDay,
                status: 'leave',
                reason: `Approved Leave: ${leaveType}${reason ? ' (' + reason + ')' : ''}`,
                location: 'Remote/Leave'
              });
            }
          } catch (err) {
            console.error('Error creating leave attendance:', err.message);
          }
          curr.setDate(curr.getDate() + 1);
        }
      }
      res.json(leave);
    } else {
      res.status(404).json({ message: 'Leave not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (leave) {
      await leave.deleteOne();
      res.json({ message: 'Leave removed' });
    } else {
      res.status(404).json({ message: 'Leave not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaves,
  getLeaveById,
  createLeave,
  updateLeave,
  deleteLeave
};
