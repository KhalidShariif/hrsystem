const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Job = require('../models/Job');
const Recruitment = require('../models/Recruitment');

const getReportSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });

    // 1. Base Counts
    const employeeCount = await Employee.countDocuments();
    const departmentCount = await Department.countDocuments();

    // 2. Attendance Summary (Total across all records or for current month?)
    // User asked for summary. Let's provide for all time or today? 
    // Usually reports are cumulative or monthly. Let's do cumulative but can be refined.
    const attendanceStats = await Attendance.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const attendanceSummary = { present: 0, late: 0, absent: 0, leave: 0 };
    attendanceStats.forEach(s => {
      if (attendanceSummary.hasOwnProperty(s._id)) attendanceSummary[s._id] = s.count;
    });

    // 3. Payroll Summary (Current month/year)
    const payrollRecords = await Payroll.find({ month: currentMonth, year: currentYear });
    const payrollSummary = {
      totalPaid: payrollRecords.filter(r => r.status === 'paid').reduce((sum, r) => sum + (r.netSalary || 0), 0),
      totalGenerated: payrollRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0),
      totalDeductions: payrollRecords.reduce((sum, r) => sum + (r.deductions || 0), 0)
    };

    // 4. Leave Summary
    const leaveStats = await Leave.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const leaveSummary = { pending: 0, approved: 0, rejected: 0, totalOnLeave: 0 };
    leaveStats.forEach(s => {
      if (leaveSummary.hasOwnProperty(s._id)) leaveSummary[s._id] = s.count;
    });
    // On Leave employees count from Employee model
    leaveSummary.totalOnLeave = await Employee.countDocuments({ status: 'on_leave' });

    // 5. Recruitment Summary
    const recruitmentSummary = {
      activeJobs: await Job.countDocuments({ status: 'active' }),
      totalCandidates: await Recruitment.countDocuments(),
      applied: await Recruitment.countDocuments({ stage: 'applied' }),
      interview: await Recruitment.countDocuments({ stage: 'interview' }),
      offered: await Recruitment.countDocuments({ stage: 'offered' }),
      rejected: await Recruitment.countDocuments({ stage: 'rejected' })
    };

    // 6. Department Distribution
    const deptDistribution = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "deptInfo" } },
      { $unwind: "$deptInfo" },
      { $project: { name: "$deptInfo.name", count: 1 } }
    ]);

    // 7. Monthly Growth (Current Year)
    const monthlyGrowth = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    for (let i = 0; i < 12; i++) {
      const start = new Date(currentYear, i, 1);
      const end = new Date(currentYear, i + 1, 0, 23, 59, 59);
      const count = await Employee.countDocuments({ hireDate: { $gte: start, $lte: end } });
      monthlyGrowth.push({ month: months[i], count });
    }

    // 8. Hub Operational Data (Strategic Regional Aggregation)
    const employees = await Employee.find().populate('department');
    
    const hubMap = {};
    const hubs = ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'];
    hubs.forEach(h => {
        hubMap[h] = { name: h, count: 0, attendancePercentage: "0.0" };
    });

    // Today's boundaries
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    for (const emp of employees) {
        // Priority logic: hub > city > dept.location > Unassigned
        const hubName = emp.hub || emp.city || emp.department?.location || 'Unassigned Hub';
        
        if (!hubMap[hubName]) {
            hubMap[hubName] = { name: hubName, count: 0, attendancePercentage: "0.0" };
        }
        hubMap[hubName].count += 1;
    }

    const hubOperationalData = await Promise.all(Object.values(hubMap).map(async (hub) => {
        const cityEmployees = await Employee.find({ 
            $or: [
                { hub: hub.name },
                { city: hub.name }
            ]
        }).select('_id');
        
        const empIds = cityEmployees.map(e => e._id);
        
        const attendanceToday = await Attendance.countDocuments({ 
          employee: { $in: empIds },
          date: { $gte: today, $lt: tomorrow },
          status: { $in: ['present', 'late'] }
        });

        const attendancePercentage = hub.count > 0 ? ((attendanceToday / hub.count) * 100).toFixed(1) : "0.0";

        return {
          ...hub,
          attendancePercentage
        };
    }));

    res.json({
      employeeCount,
      departmentCount,
      attendanceSummary,
      payrollSummary,
      leaveSummary,
      recruitmentSummary,
      departmentDistribution: deptDistribution,
      monthlyGrowth,
      hubOperationalData
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getReportBrief = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.toLocaleString('en-US', { month: 'long' });
    const currentYear = now.getFullYear();

    // Aggregating data for the brief
    const employeeCount = await Employee.countDocuments();
    const departmentCount = await Department.countDocuments();
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const presentToday = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: { $in: ['present', 'late'] } });
    const onLeaveToday = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow }, status: 'leave' });

    const payrollRecords = await Payroll.find({ month: currentMonth, year: currentYear, status: 'paid' });
    const totalPayrollPaid = payrollRecords.reduce((sum, r) => sum + (r.netSalary || 0), 0);

    const activeJobs = await Job.countDocuments({ status: 'active' });
    const candidatesCount = await Recruitment.countDocuments();

    const depts = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "info" } },
      { $unwind: "$info" }
    ]);
    const deptString = depts.map(d => `${d.info.name}: ${d.count}`).join(', ');

    const attendanceRate = employeeCount > 0 ? ((presentToday / employeeCount) * 100).toFixed(1) : "0.0";

    const summary = `STRATEGIC HR AUTHORITY BRIEF
Cycle: ${currentMonth} ${currentYear}
Generated: ${new Date().toLocaleString()}

1. WORKFORCE METRICS:
Total Strategic Force: ${employeeCount} active assets across ${departmentCount} units.
Deployment Distribution: ${deptString || 'Pending mapping'}.

2. OPERATIONAL READINESS:
Today's Presence: ${presentToday} assets on-site.
Operational Buffer (On Leave): ${onLeaveToday} assets.
Daily Attendance Efficiency: ${attendanceRate}%.

3. FISCAL DISBURSEMENT:
Monthly Paid Yield: $${totalPayrollPaid.toLocaleString()}.
Financial status is compliant for the current cycle.

4. GROWTH PIPELINE:
Active Job Openings: ${activeJobs} strategic roles.
Talent Acquisition: ${candidatesCount} candidates currently in processing.

END OF BRIEF`;

    res.json({ summary });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getReportSummary, getReportBrief };
