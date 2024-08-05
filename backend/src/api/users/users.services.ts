const bcrypt = require('bcrypt');
import {  User as PrismaUser, RefreshToken} from '@prisma/client';
import db from '../../lib/db';

function findUserByEmail(email: string): Promise<User | null> {
  // console.log(db); // Add this line to check if db is correctly initialized
  try {
    const user = db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new Error('User not found code line 17');
    }
    return user;
  }
  catch (err) {
    console.log(err);
    throw new Error('User not found');
    // return db.user.findUnique({
    //   where: {
    //     email,
    //   },
    // });
  }
}

function createUserByEmailAndPassword(user: { email: string; password: string; name: string }): Promise<User> {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: {
      email: user.email,
      password: user.password,
      name: user.name,
    }
  });
}

// Extend the User type to include refreshTokens
interface User extends PrismaUser {
  refreshTokens?: RefreshToken[];
}

function findUserById(id: string): Promise<User | null> {
  return db.user.findUnique({
    where: {
      id,
    },
    include: {
      refreshTokens: true,
    },
  });
}


function getUserDetails(userId: string) {

  return db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
      name: true,
      createdAt: true,
      IsAdmin: true,
    },
  });
}

function getAllUsers(): Promise<User[]> {
  return db.user.findMany();
}

export { findUserByEmail, findUserById, getUserDetails, createUserByEmailAndPassword, getAllUsers };