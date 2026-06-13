const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['all', 'branch', 'department'], 
    default: 'all' 
  },
  targetValue: { type: String }, // Branch name or Department ID/name
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
