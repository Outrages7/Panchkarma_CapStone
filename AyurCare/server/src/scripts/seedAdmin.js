import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

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

const DEFAULT_ADMIN = {
  firstName: 'Super',
  lastName: 'Admin',
  email: 'admin@ayurcare.com',
  password: 'Admin@123',
  phone: '9999999999',
  role: 'admin',
  department: 'Administration',
  isEmailVerified: true,
};

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI not found in environment variables');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully.\n');

    const existing = await User.findOne({ email: DEFAULT_ADMIN.email });

    if (existing) {
      console.log(`  ℹ Admin already exists: ${DEFAULT_ADMIN.email}`);
      console.log('  Skipping creation. If you need to reset the password, delete the account first.\n');
    } else {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

      await User.create({
        ...DEFAULT_ADMIN,
        password: hashedPassword,
      });

      console.log('  ✓ Admin account created successfully!');
      console.log(`    Email:    ${DEFAULT_ADMIN.email}`);
      console.log(`    Password: ${DEFAULT_ADMIN.password}`);
      console.log('    ⚠ Change the password after first login.\n');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
