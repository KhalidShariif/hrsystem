const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // Link to Job
  desiredRole: { type: String }, // For display/fallback
  stage: { type: String, default: 'applied' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  appliedDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
