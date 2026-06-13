const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');

const getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalHRManagers = await User.countDocuments({ role: 'hr_manager' });
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const approvedToday = await Leave.countDocuments({ 
      status: 'approved',
      updatedAt: { $gte: today }
    });
    
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();

    const payrolls = await Payroll.find({ month: currentMonth, year: currentYear, status: 'paid' });
    const monthlyPayrollTotal = payrolls.reduce((acc, curr) => acc + curr.netSalary, 0);

    const recentEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);
    
    const todayAttendance = await Attendance.find({ date: { $gte: today, $lt: tomorrow } });
    const totalOnLeave = todayAttendance.filter(a => a.status === 'leave').length;
    const totalAbsent = todayAttendance.filter(a => a.status === 'absent').length;
    const totalPresent = todayAttendance.filter(a => a.status === 'present').length;
    const totalLate = todayAttendance.filter(a => a.status === 'late').length;

    const absenteeismRate = totalEmployees > 0 ? (((totalOnLeave + totalAbsent) / totalEmployees) * 100).toFixed(1) : 0;

    // Force Distribution (Departmental)
    const departments = await Department.find();
    const departmentDistribution = await Promise.all(departments.map(async (dept) => {
      const count = await Employee.countDocuments({ department: dept._id });
      return {
        name: dept.name,
        count,
        value: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0
      };
    }));

    // Regional Hub Distribution
    const employees = await Employee.find();
    const hubs = ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'];
    const hubOperationalData = hubs.map(hub => {
      const count = employees.filter(e => e.city === hub).length;
      return {
        name: hub,
        count,
        attendancePercentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0 // Placeholder logic for hub-specific attendance if needed
      };
    });

    res.json({
      totalEmployees,
      totalDepartments,
      totalHRManagers,
      pendingLeaves,
      monthlyPayrollTotal,
      recentEmployees,
      attendanceSummary: totalPresent + totalLate,
      totalOnLeave,
      totalAbsent,
      absenteeismRate,
      approvedToday,
      departmentDistribution,
      hubOperationalData
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
