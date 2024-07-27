import { Request, Response } from 'express';
function sendRefreshToken(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      sameSite: true,
      path: '/auth',
    });
  }
  
  module.exports = { sendRefreshToken };