const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['application', 'leave', 'attendance', 'system', 'status'], 
    required: true 
  },
  isRead: { type: Boolean, default: false },
  targetRole: { 
    type: String, 
    enum: ['admin', 'hr_manager', 'employee', 'all'], 
    default: 'admin' 
  },
  referenceId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
