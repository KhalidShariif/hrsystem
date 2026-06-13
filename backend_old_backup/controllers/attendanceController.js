const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

const getAttendances = async (req, res, next) => {
  try {
    let query = {};
    if (req.query.date) {
      let targetDate = new Date();
      if (req.query.date !== 'today') {
        targetDate = new Date(req.query.date);
      }
      targetDate.setHours(0,0,0,0);
      const end = new Date(targetDate);
      end.setDate(end.getDate() + 1);
      query.date = { $gte: targetDate, $lt: end };
    }

    let attendances = await Attendance.find(query).populate({ path: 'employee', select: 'firstName lastName employeeId position department city hub', populate: { path: 'department', select: 'name' } });
    
    // HR manager restriction: Only see attendance in assigned hub/district
    if (req.user.role === 'hr_manager') {
      attendances = attendances.filter(a => {
        const matchesHub = a.employee?.hub === req.user.region;
        const matchesDistrict = !req.user.district || a.employee?.district === req.user.district;
        return matchesHub && matchesDistrict;
      });
    }

    attendances = attendances.filter(a => a.employee != null);
    console.log('Attendance records returned', attendances.length);
    res.json(attendances);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAttendanceById = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id).populate({ path: 'employee', select: 'firstName lastName employeeId position department city hub', populate: { path: 'department', select: 'name' } });
    if (attendance) {
      res.json(attendance);
    } else {
      res.status(404).json({ message: 'Attendance not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const createAttendance = async (req, res, next) => {
  try {
    console.log("Attendance payload received:", req.body);
    const { employee, date, status, checkIn, checkOut, reason } = req.body;

    // HR manager restriction: Access check for hub and district
    if (req.user.role === 'hr_manager') {
      const Employee = require('../models/Employee');
      const emp = await Employee.findById(employee);
      const matchesHub = emp && emp.hub === req.user.region;
      const matchesDistrict = !req.user.district || (emp && emp.district === req.user.district);
      if (!matchesHub || !matchesDistrict) {
        return res.status(403).json({ message: 'Access denied: Employee not in your assigned regional sector.' });
      }
    }
    
    // Normalize status
    let normalizedStatus = (status || '').toLowerCase().trim();
    if (normalizedStatus === 'on leave') normalizedStatus = 'leave';
    console.log("Status normalized:", normalizedStatus);

    if (['present', 'late'].includes(normalizedStatus)) {
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: 'Check-in and Check-out are required' });
      }
      if (checkOut <= checkIn) {
        return res.status(400).json({ message: 'Check-out must be after check-in' });
      }
    }
    
    const normalizedDate = new Date(date || Date.now());
    normalizedDate.setHours(0,0,0,0);
    const end = new Date(normalizedDate);
    end.setDate(end.getDate() + 1);

    const existing = await Attendance.findOne({
      employee,
      date: { $gte: normalizedDate, $lt: end }
    });

    if (existing) {
      return res.status(400).json({ message: 'Attendance already recorded for this employee today' });
    }

    const attendance = new Attendance({
        ...req.body,
        status: normalizedStatus,
        date: normalizedDate
    });
    const createdAttendance = await attendance.save();
    console.log('Attendance saved', createdAttendance);

    if (normalizedStatus === "leave") {
      console.log("Leave creation started for employee:", employee);
      const leave = await Leave.findOneAndUpdate(
        {
          employee,
          startDate: normalizedDate,
          endDate: normalizedDate
        },
        {
          employee,
          leaveType: "Attendance Leave",
          startDate: normalizedDate,
          endDate: normalizedDate,
          totalDays: 1,
          reason: reason || "Marked as leave from attendance",
          status: "approved"
        },
        { upsert: true, new: true }
      );
    
      console.log("Leave created successfully:", leave);
    }
    if (normalizedStatus === "leave" || normalizedStatus === "absent") {
      try {
        const Employee = require('../models/Employee');
        const emp = await Employee.findById(employee);
        const Notification = require('../models/Notification');
        await Notification.create({
          title: `Attendance: ${normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}`,
          message: `${emp ? emp.firstName + ' ' + emp.lastName : 'An employee'} was marked ${normalizedStatus} today.`,
          type: 'attendance',
          targetRole: 'admin',
          referenceId: employee
        });
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    }

    res.status(201).json(createdAttendance);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already recorded for this employee today' });
    }
    res.status(400).json({ message: error.message });
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { employee, date, status, checkIn, checkOut, reason } = req.body;
    
    if (['present', 'late'].includes(status)) {
      if (!checkIn || !checkOut) {
        return res.status(400).json({ message: 'Check-in and Check-out are required' });
      }
      if (checkOut <= checkIn) {
        return res.status(400).json({ message: 'Check-out must be after check-in' });
      }
    }

    if (date || employee) {
      const targetDate = new Date(date || Date.now());
      targetDate.setHours(0,0,0,0);
      
      const start = new Date(targetDate);
      const end = new Date(targetDate);
      end.setDate(end.getDate() + 1);

      const existing = await Attendance.findOne({
        _id: { $ne: req.params.id },
        employee: employee || (await Attendance.findById(req.params.id)).employee,
        date: { $gte: start, $lt: end }
      });

      if (existing) {
        return res.status(400).json({ message: 'Attendance already recorded for this employee on this date' });
      }
      if (date) req.body.date = targetDate;
    }

    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (attendance) {
      if (status === 'leave') {
        const start = attendance.date;
        console.log("Updating leave from attendance update", status, attendance.employee, start);
        const leave = await Leave.findOneAndUpdate(
          {
            employee: attendance.employee,
            startDate: start,
            endDate: start
          },
          {
            employee: attendance.employee,
            leaveType: "Attendance Leave",
            startDate: start,
            endDate: start,
            totalDays: 1,
            reason: reason || "Updated from attendance log",
            status: "approved"
          },
          { upsert: true, new: true }
        );
        console.log("Leave saved/updated", leave);
      }
      res.json(attendance);
    } else {
      res.status(404).json({ message: 'Attendance not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (attendance) {
      await attendance.deleteOne();
      res.json({ message: 'Attendance removed' });
    } else {
      res.status(404).json({ message: 'Attendance not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttendances,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance
};
