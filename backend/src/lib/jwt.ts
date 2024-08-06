const jwt = require('jsonwebtoken');

interface User {
    id: string;
    }


// Usually I keep the token between 5 minutes - 15 minutes
function generateAccessToken(user: User) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '3h',
  });
}

function generateRefreshToken(user: User, jti: String ) {
  return jwt.sign({
    userId: user.id,
    jti
  }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '8h',
  });
}

function generateTokens(user: User, jti: String) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return {
    accessToken,
    refreshToken,
  };
}

export default module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens
};