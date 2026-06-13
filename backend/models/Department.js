const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: { type: String },
  totalEmployees: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Department', departmentSchema);
