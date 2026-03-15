const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Admin details
    const adminData = {
      name: 'Admin',
      email: 'admin@cargoconnect.com',
      password: 'admin123', // Change this password!
      role: 'admin',
      phone: '9999999999',
      isVerified: true, // Admin is pre-verified
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('❌ Admin user already exists with email:', adminData.email);
      console.log('Use this account to login:');
      console.log('Email:', adminData.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminData);

    console.log('✅ Admin user created successfully!');
    console.log('\n=== ADMIN LOGIN CREDENTIALS ===');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('================================\n');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    console.log('\nYou can now login at: http://localhost:5173/login');
    console.log('After login, you will be redirected to: /admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
