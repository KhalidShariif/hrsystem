const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, index: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  position: { type: String },
  salary: { type: Number },
  city: { type: String },
  district: { type: String },
  hub: { type: String, enum: ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'], default: 'Mogadishu' },
  hireDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
  employeeType: { type: String, enum: ['full_time', 'contractor'], default: 'full_time' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notificationSettings: {
    announcements: { type: Boolean, default: true },
    attendance: { type: Boolean, default: true },
    leave: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});

employeeSchema.pre('validate', async function() {
  if (!this.employeeId) {
    let location = 'Banaadir';
    const city = (this.city || '').toLowerCase();
    const hub = (this.hub || '').toLowerCase();
    
    if (city.includes('hargeisa') || hub.includes('hargeisa')) {
      location = 'Hargeisa';
    } else if (city.includes('garowe') || hub.includes('garowe')) {
      location = 'Garowe';
    } else if (city.includes('kismayo') || hub.includes('kismayo')) {
      location = 'Kismayo';
    } else if (city.includes('mogadishu') || hub.includes('mogadishu') || city.includes('banaadir') || hub.includes('banaadir')) {
      location = 'Banaadir';
    }

    const prefix = location;
    
    // Find latest employee with same prefix
    const Employee = mongoose.model('Employee');
    const latestEmployee = await Employee.findOne({ 
      employeeId: new RegExp(`^${prefix}\\d+`) 
    }).sort({ employeeId: -1 });

    let nextNumber = 100;
    if (latestEmployee) {
      const match = latestEmployee.employeeId.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    this.employeeId = `${prefix}${nextNumber}`;
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
