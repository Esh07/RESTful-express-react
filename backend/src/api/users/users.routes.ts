import express, { Request, Response, NextFunction } from 'express';
const { isAuthenticated } = require('../../middlewares');
const { findUserById } = require('./user.services');

const router = express.Router();

export interface Payload {
  userId: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    payload?: Payload;
  }
}

router.get('/profile', isAuthenticated, async (req : Request, res : Response, next : NextFunction) => {
  try {
    const { userId } = req.payload as { userId: string };
    const user = await findUserById(userId);
    if (!user) {
      return res.sendStatus(404);
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
    // delete user.password;
    // res.json(user);
  } catch (err) {
    console.error('Error getting user profile', err);
    next(err);
  }
});

module.exports = router;
