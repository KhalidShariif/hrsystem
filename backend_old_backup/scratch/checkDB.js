const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Employee = require('../models/Employee');
const Application = require('../models/Application');

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const employees = await Employee.find({});
    console.log('--- EMPLOYEES ---');
    employees.forEach(e => console.log(`${e.firstName} ${e.lastName} | ${e.employeeId} | ${e.city}`));
    
    const apps = await Application.find({});
    console.log('\n--- APPLICATIONS ---');
    apps.forEach(a => console.log(`${a.fullName} | ${a.stage}`));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkData();
