// utils/authUtils.ts
// import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';

const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePasswords = async (inputPassword: string, storedPassword: string) => {
  return bcrypt.compare(inputPassword, storedPassword);
};


export function clearCookies(res: Response, cookies: string[]) {
  if (!res || typeof res.clearCookie !== 'function') {
    console.error('Invalid response object provided.');
    return;
  }

  if (!Array.isArray(cookies)) {
    console.error('Cookies should be an array.');
    return;
  }

  cookies.forEach(cookie => {
    try {
      res.clearCookie(cookie, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        path: '/', 
        expires: new Date(0)
      });
    } catch (error) {
      console.error(`Failed to clear cookie: ${cookie}`, error);
    }
  });
}