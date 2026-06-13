const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  appliedRole: {
    type: String,
    required: [true, 'Please specify the applied role']
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  coverLetter: {
    type: String
  },
  stage: {
    type: String,
    enum: ['APPLIED', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'],
    default: 'APPLIED'
  },
  status: {
    type: String,
    default: 'Active'
  },
  cvFile: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
