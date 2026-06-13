const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String }, // Or ref: 'Department' if preferred, but user said "Department" in form fields
  location: { type: String },
  district: { type: String },
  type: { type: String }, // Full-time, Part-time, etc.
  salary: { type: String },
  description: { type: String },
  requirements: { type: String },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);
