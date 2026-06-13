require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected for Seeding');

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@hr.com',
        password: 'password123',
        role: 'admin',
        status: 'active',
        isActive: true
      });
      await admin.save();
      console.log('Default admin seeded: admin@hr.com / password123');
    } else {
      console.log('Admin already exists, skipping seed.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedAdmin();
