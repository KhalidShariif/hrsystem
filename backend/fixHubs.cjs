const mongoose = require('mongoose');
const Employee = require('./models/Employee');

async function fix() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/hayaan_hr');
    const result = await Employee.updateMany(
      { hub: { $exists: false } }, 
      { $set: { hub: 'Mogadishu' } }
    );
    console.log('Updated', result.modifiedCount, 'employees');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
fix();
