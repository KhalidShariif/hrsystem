const User = require('../models/User');

const getUsers = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create(req.body);
    const createdUser = await User.findById(user._id).select('-password');
    return res.status(201).json(createdUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (user) return res.json(user);
    else return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.role = req.body.role || user.role;
      user.status = req.body.status || user.status;
      if (req.body.status) {
        user.isActive = req.body.status !== 'cancelled';
      }
      user.region = req.body.region || user.region;
      user.district = req.body.district !== undefined ? req.body.district : user.district;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const responseUser = await User.findById(updatedUser._id).select('-password');
      return res.json(responseUser);
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      return res.json({ message: 'User removed' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }
      
      // Save path with profiles subfolder
      user.profileImage = `/uploads/profiles/${req.file.filename}`;
      const updatedUser = await user.save();
      
      // Select updated user without password
      const responseUser = await User.findById(updatedUser._id).select('-password');
      
      return res.json({ 
        success: true,
        message: 'Profile image updated successfully',
        profileImage: user.profileImage,
        user: responseUser
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Profile upload error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Admin from disabling own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin cannot disable their own account.' });
    }

    const { status } = req.body;
    
    if (status === 'cancelled') {
      user.status = 'cancelled';
      user.isActive = false;
      // Also set to inactive if cancelled
      user.onlineStatus = 'inactive';
    } else {
      user.status = 'active';
      user.isActive = true;
    }

    const updatedUser = await user.save();
    const responseUser = await User.findById(updatedUser._id).select('-password');
    return res.json(responseUser);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsers, createUser, getUserById, updateUser, deleteUser, uploadProfileImage, toggleStatus };
