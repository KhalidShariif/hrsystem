const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const Recruitment = require('./models/Recruitment');
const Job = require('./models/Job');
const Setting = require('./models/Setting');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected for Seeding'))
  .catch(err => console.log(err));

const seedDB = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Employee.deleteMany();
    await Department.deleteMany();
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Payroll.deleteMany();
    await Recruitment.deleteMany();
    await Job.deleteMany();
    await Setting.deleteMany();

    console.log('Old data cleared.');

    const salt = await bcrypt.genSalt(10);

    // Create Admin User
    const adminUser = new User({
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@hr.com',
      password: 'Admin12345',
      phone: '1234567890',
      role: 'admin',
      status: 'active'
    });
    await adminUser.save();

    // Create Settings
    const settings = [
      { key: 'twoFA', value: true },
      { key: 'expiry', value: false },
      { key: 'notifications', value: true }
    ];
    for (let setting of settings) {
      await (new Setting(setting)).save();
    }

    console.log('Database initialized with Admin only.');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
