import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Inline schema to avoid circular imports
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
  isEmailVerified: { type: Boolean, default: false },
  department: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const FIXED_ADMIN = {
  firstName: 'AyurCare',
  lastName: 'Admin',
  email: 'admin@ayurcare.com',
  password: 'Admin@123',
  phone: '9876543210',
  role: 'admin',
  department: 'Administration',
  isEmailVerified: true,
};

async function createFixedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.\n');

    // Delete the problematic admin account
    const deleteResult = await User.deleteOne({ email: 'admin@ayurcare.local' });
    if (deleteResult.deletedCount > 0) {
      console.log('✓ Deleted problematic admin account');
    }

    // Check if fixed admin already exists
    const existing = await User.findOne({ email: FIXED_ADMIN.email });

    if (existing) {
      console.log(`  ℹ Admin ${FIXED_ADMIN.email} already exists`);
      console.log('  Skipping creation.\n');
    } else {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(FIXED_ADMIN.password, salt);

      await User.create({
        ...FIXED_ADMIN,
        password: hashedPassword,
      });

      console.log('  ✓ Fixed admin account created successfully!');
      console.log(`    Email:    ${FIXED_ADMIN.email}`);
      console.log(`    Password: ${FIXED_ADMIN.password}`);
      console.log('    ⚠ Change the password after first login.\n');
    }

    // Test login
    console.log('Testing login...');
    const testUser = await User.findOne({ email: FIXED_ADMIN.email }).select('+password');
    if (testUser) {
      const isMatch = await bcrypt.compare(FIXED_ADMIN.password, testUser.password);
      console.log(`  ✓ Password match: ${isMatch}`);
    }

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createFixedAdmin();
