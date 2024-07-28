const bcrypt = require('bcrypt');
import { User } from '@prisma/client';
import db from '../../lib/db';

function findUserByEmail(email: string) : Promise<User | null> {
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
      data: user,
    });
  }

  function findUserById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: {
        id,
      },
    });
  }

  // module.exports = {
  //   findUserByEmail,
  //   findUserById,
  //   createUserByEmailAndPassword
  // };

  export { findUserByEmail, findUserById, createUserByEmailAndPassword };