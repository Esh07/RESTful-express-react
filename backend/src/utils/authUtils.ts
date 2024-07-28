// utils/authUtils.ts
// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (inputPassword: string, storedPassword: string) => {
  return bcrypt.compare(inputPassword, storedPassword);
};