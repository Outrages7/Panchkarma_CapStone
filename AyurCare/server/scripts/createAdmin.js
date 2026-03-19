import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('\n⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.firstName} ${existingAdmin.lastName}`);
      process.exit(0);
    }

    console.log('\n👤 Creating admin user...');
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'MediQueue',
      email: 'admin@mediqueue.com',
      password: 'admin@123',
      phone: '9999999999',
      role: 'admin',
      department: 'Management',
      isEmailVerified: true,
      isApproved: true,
      permissions: ['all'],
    });

    console.log('✅ Admin user created successfully!');
    console.log('\n📝 Admin credentials:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: admin@123`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Department: ${admin.department}`);
    console.log('\n⚠️  IMPORTANT: Change the admin password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
