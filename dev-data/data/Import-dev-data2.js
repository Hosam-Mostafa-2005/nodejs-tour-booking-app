import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../../models/userModel.js';
import 'dotenv/config';

const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => console.log('DB connected ✅'));

const users = [
  {
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    password: '12345678',
    passwordConfirm: '12345678',
    role: 'admin',
  },
  {
    name: 'Mohamed Ali',
    email: 'mohamed@example.com',
    password: '12345678',
    passwordConfirm: '12345678',
  },
  {
    name: 'Sara Mostafa',
    email: 'sara@example.com',
    password: '12345678',
    passwordConfirm: '12345678',
  },
];

const importData = async () => {
  try {
    await User.create(users);
    console.log('Data Imported 🚀');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data Deleted 🗑️');
    process.exit();
  } catch (err) {
    console.error(err);
  }
};

// تشغيل بالأمر
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
