const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  checkIn: { 
    type: String,
    required: function() {
      return this.status === 'present' || this.status === 'late';
    }
  },
  checkOut: { 
    type: String,
    required: function() {
      return this.status === 'present' || this.status === 'late';
    }
  },
  status: { type: String, enum: ['present', 'absent', 'late', 'leave'], default: 'present' },
  reason: { 
    type: String,
    required: function() {
      return this.status === 'absent' || this.status === 'leave';
    }
  },
  workHours: { type: Number },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
