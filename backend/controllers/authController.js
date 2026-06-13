const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || 'employee'
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if account is disabled
      if (user.status === 'cancelled') {
        return res.status(403).json({ message: 'Your account has been disabled. Contact admin.' });
      }

      // Update online status
      user.onlineStatus = 'active';
      user.lastLogin = new Date();
      await user.save();

      // Trigger notification for HR login
      if (user.role === 'hr_manager') {
        try {
          const Notification = require('../models/Notification');
          await Notification.create({
            title: 'HR Manager Online',
            message: `HR Manager ${user.firstName} ${user.lastName} has logged into the system.`,
            type: 'status',
            targetRole: 'admin',
            referenceId: user._id
          });
        } catch (notifErr) {
          console.error('Failed to create notification:', notifErr);
        }
      }

      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        region: user.region,
        status: user.status,
        onlineStatus: user.onlineStatus,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const logoutUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.onlineStatus = 'inactive';
      user.lastSeen = new Date();
      await user.save();
      return res.json({ message: 'Logged out successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe
};
