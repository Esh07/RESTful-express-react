import express, { Request, Response, NextFunction } from 'express';
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('./users.services');

const router = express.Router();

export interface Payload {
  userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    payload?: Payload;
  }
}

router.get('/profile', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // console.log('Profile route');
    // console.log('req.payload', req.payload);
    const userId = req.payload?.userId;

    const user = await findUserById(userId);
    // console.log('user', user);
    if (!user) {
      return res.sendStatus(404).json({ message: 'User not found' });
    }

    const { password, IsAdmin, refreshTokens, updatedAt, ...userWithoutPassword } = user;
    // console.log('user profile', userWithoutPassword);
    res.json(userWithoutPassword);
  } catch (err) {
    console.error('Error getting user profile', err);
    next(err);
  }
});

module.exports = { user: router };
