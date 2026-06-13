const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Recruitment = require('../models/Recruitment');
const Job = require('../models/Job');
const Application = require('../models/Application');

const cleanMockData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // Define mock identifiers
    const mockEmails = [
      /hr\d+@hr\.com/,
      /employee\d+@hr\.com/,
      /candidate\d+@test\.com/
    ];

    const mockNames = [
      'Abdi Hassan', 'Hodan Ali', 'Khalid Omar', 'Fadumo Warsame',
      'Yusuf Ahmed', 'Sahra Moalim', 'Mahad Jama', 'Deeqa Abdi',
      'Candidate 1', 'Candidate 2', 'Candidate 3', 'Candidate 4', 'Candidate 5'
    ];

    console.log('Starting cleanup of mock/demo records...');

    // 1. Delete Users
    const deletedUsers = await User.deleteMany({
      $or: [
        { email: { $in: mockEmails } },
        { firstName: { $in: ['HR', 'Employee'] } },
        { lastName: { $in: ['Manager1', 'Manager2', 'Manager3'] } }
      ]
    });
    console.log(`- Deleted ${deletedUsers.deletedCount} mock users.`);

    // 2. Delete Employees
    const deletedEmployees = await Employee.deleteMany({
      $or: [
        { email: { $in: mockEmails } },
        { firstName: { $in: ['Abdi', 'Hodan', 'Khalid', 'Fadumo', 'Yusuf', 'Sahra', 'Mahad', 'Deeqa'] } }
      ]
    });
    console.log(`- Deleted ${deletedEmployees.deletedCount} mock employees.`);

    // 3. Delete Recruitments/Applications
    const deletedRecs = await Recruitment.deleteMany({
      $or: [
        { candidateName: { $regex: /^Candidate \d+/i } },
        { email: { $in: mockEmails } }
      ]
    });
    console.log(`- Deleted ${deletedRecs.deletedCount} mock recruitment records.`);

    // 4. Delete dangling references in Attendance, Leave, Payroll
    // Since we deleted employees, we should clear their records
    const remainingEmpIds = (await Employee.find({}, '_id')).map(e => e._id);
    
    const delAtt = await Attendance.deleteMany({ employee: { $nin: remainingEmpIds } });
    console.log(`- Deleted ${delAtt.deletedCount} orphaned attendance records.`);

    const delLeave = await Leave.deleteMany({ employee: { $nin: remainingEmpIds } });
    console.log(`- Deleted ${delLeave.deletedCount} orphaned leave records.`);

    const delPay = await Payroll.deleteMany({ employeeId: { $nin: remainingEmpIds } });
    console.log(`- Deleted ${delPay.deletedCount} orphaned payroll records.`);

    // 5. Delete mock Jobs
    const delJobs = await Job.deleteMany({
      title: { $in: ['Senior Engineer', 'Financial Analyst'] }
    });
    console.log(`- Deleted ${delJobs.deletedCount} mock jobs.`);

    console.log('Cleanup protocol completed.');
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanMockData();
