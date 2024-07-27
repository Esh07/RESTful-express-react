const bcrypt = require('bcrypt');
const { db } = require('../../lib/db');

function findUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

function createUserByEmailAndPassword(user: { email: string; password: string }) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function findUserById(id: string) {
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

export default { findUserByEmail, findUserById, createUserByEmailAndPassword };