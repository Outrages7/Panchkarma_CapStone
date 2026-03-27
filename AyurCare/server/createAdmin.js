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

const NEW_ADMIN = {
  firstName: 'AyurCare',
  lastName: 'Admin',
  email: 'admin@ayurcare.local',
  password: 'Admin@123',
  phone: '9876543210',
  role: 'admin',
  department: 'Administration',
  isEmailVerified: true,
};

async function createNewAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.\n');

    // Check existing admins
    const existingAdmins = await User.find({ role: 'admin' });
    console.log(`Found ${existingAdmins.length} existing admin(s):`);
    existingAdmins.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });
    console.log('');

    // Check if new admin already exists
    const existing = await User.findOne({ email: NEW_ADMIN.email });

    if (existing) {
      console.log(`  ℹ Admin ${NEW_ADMIN.email} already exists`);
      console.log('  Skipping creation.\n');
    } else {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(NEW_ADMIN.password, salt);

      await User.create({
        ...NEW_ADMIN,
        password: hashedPassword,
      });

      console.log('  ✓ New admin account created successfully!');
      console.log(`    Email:    ${NEW_ADMIN.email}`);
      console.log(`    Password: ${NEW_ADMIN.password}`);
      console.log('    ⚠ Change the password after first login.\n');
    }
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

createNewAdmin();
