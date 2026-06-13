const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const Employee = require('../models/Employee');

const migrate = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees to re-index.`);

    // First pass: set temporary IDs to avoid clashes
    console.log('Resetting IDs to temporary format...');
    for (let emp of employees) {
        await Employee.updateOne({ _id: emp._id }, { $set: { employeeId: `TEMP-${emp._id}` } });
    }

    const locationCounters = {};

    console.log('Employee Name | Location | Old ID | New ID');
    console.log('-------------------------------------------');

    for (let emp of employees) {
      const oldId = emp.employeeId;
      
      // Determine location - prioritize specific cities over generic hubs
      let location = 'Banaadir';
      const city = (emp.city || '').toLowerCase();
      const hub = (emp.hub || '').toLowerCase();
      const region = (emp.region || '').toLowerCase();
      const rawLoc = (emp.location || '').toLowerCase();

      if ([city, hub, region, rawLoc].some(l => l.includes('hargeisa'))) {
        location = 'Hargeisa';
      } else if ([city, hub, region, rawLoc].some(l => l.includes('garowe'))) {
        location = 'Garowe';
      } else if ([city, hub, region, rawLoc].some(l => l.includes('kismayo'))) {
        location = 'Kismayo';
      } else if ([city, hub, region, rawLoc].some(l => l.includes('mogadishu') || l.includes('banaadir'))) {
        location = 'Banaadir';
      }

      const prefix = location;
      
      if (!locationCounters[prefix]) {
        locationCounters[prefix] = 100;
      }

      const newId = `${prefix}${locationCounters[prefix]}`;
      locationCounters[prefix]++;

      emp.employeeId = newId;
      await emp.save();

      console.log(`${emp.firstName} ${emp.lastName} | ${location} | ${oldId} | ${newId}`);
    }

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
