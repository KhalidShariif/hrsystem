const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['admin', 'hr_manager', 'employee'], default: 'employee' },
  status: { type: String, enum: ['active', 'inactive', 'cancelled'], default: 'active' },
  isActive: { type: Boolean, default: true },
  onlineStatus: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  lastLogin: { type: Date },
  lastSeen: { type: Date },
  region: { type: String, enum: ['Mogadishu', 'Hargeisa', 'Garowe', 'Kismayo'], default: 'Mogadishu' },
  district: { type: String },
  avatar: { type: String },
  profileImage: { type: String },
  employeeIdRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
