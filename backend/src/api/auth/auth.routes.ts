import { Request, Response, NextFunction } from "express";
import { z, ZodObject, ZodRawShape, ZodSchema, ZodString } from "zod";
import jwt from 'jsonwebtoken';

import cookie from 'cookie';
import { isAuthenticated, checkAlreadyAuthenticated } from '../../middlewares';

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { generateTokens } = require('../../lib/jwt');

const { comparePasswords } = require('../../utils/authUtils');

import { hashToken } from '../../lib/hashToken';

import { isAdmin } from '../../../middleware/roleCheck';


import {
  getUserDetails,
  findUserByEmail,
  findUserById,
  createUserByEmailAndPassword,
  getAllUsers,
} from "../users/users.services";

import {
  findRefreshTokenById,
  addRefreshTokenToWhitelist,
  revokeTokens,
  deleteRefreshToken,
  updateRefreshToken
} from "../auth/auth.services";
import { clearCookies } from "../../utils/authUtils";
// const jwt = require('jsonwebtoken');


const router = express.Router();
interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}


const registerSchemaBase = z.object({
  name: z.string({ required_error: 'Name is required.', invalid_type_error: 'Name must be a string.', }).min(2, { message: 'Name must be at least 2 characters long.' }),
  email: z.string({ required_error: 'Email is required.', }).email().min(6),
  password: z.string({ required_error: 'Password is required.', invalid_type_error: 'Password must be a string.', }).min(6, { message: 'Password must be at least 6 characters long.' }),
  confirmPassword: z.string({ required_error: 'Confirm password is required.', invalid_type_error: 'Confirm password must be a string.', }),
});


const registerSchema: ZodSchema = registerSchemaBase.superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Passwords do not match.',
      path: ['confirmPassword'],
    });
  }
}) as z.ZodEffects<ZodObject<{ email: ZodString; password: ZodString; confirmPassword: ZodString }>>;

/**
 * Validates the request body against a given schema.
 * If the request body is valid, it proceeds to the next middleware.
 * If the request body is invalid, it sends a 400 response with the validation errors.
 *
 * @param schema - The schema to validate the request body against.
 * @returns A middleware function that performs the validation.
 */
const validateRequest = (schema: z.ZodObject<any>) => (req: Request, res: Response, next: NextFunction) => {

  if (isAuthenticated(req, res, next)) {
    console.log('User is already authenticated');
    return res.status(409).json({ message: 'Already authenticated' });
  }

  try {
    const parsedData = schema.parse(req.body);

    // console.log(parsedData, "parsedData in validateRequest");

    if (parsedData.confirmPassword) {
      // apply the validation on password and confirmPassword
      schema.superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Passwords do not match.',
            path: ['confirmPassword'],
          });
        }
      }).parse(parsedData);
    }

    // attach the parsed data to the request object
    req.body = parsedData;

    // proceed to the next middleware
    next();

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ errors: err.errors });
    } else {
      next(err);
    }
  }
}

/**
 * Wraps an async route handler function to catch any errors that occur during its execution.
 * If an error occurs, it calls the next middleware with the error.
 * 
 * @param fn - The async route handler function to wrap.
 * @returns A middleware function that calls the async route handler function.
 */
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * Registers a new user.
 *  If the user already exists, it sends a 400 response with an error message.
 * If the user is successfully registered, it sends a 200 response with the access and refresh tokens.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A 201 response with the access and refresh tokens if the user is successfully registered.
 * @throws A 400 response with an error message if the user already exists.
 * @throws A 500 response if an error occurs during the creating new user process.
 */
router.post('/register', validateRequest(registerSchemaBase), asyncHandler(async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {

  const { email, password, name } = req.body;

  const existingUser = await findUserByEmail(email);
  // console.log(req.body);

  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists.' });
  }

  const user = await createUserByEmailAndPassword({ email, password, name });
  const jti = uuidv4();
  const { accessToken, refreshToken } = generateTokens(user, jti);
  await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

  return res.status(201).json({
    accessToken,
    refreshToken,
  });

}));


const loginSchema = z.object({
  email: z.string({ required_error: 'You must provide an email and password.' }).email(),
  password: z.string({ required_error: 'You must provide an email and password.' }),
});

/**
 * Logs in a user.
 * If the user does not exist or the password is incorrect, it sends a 400 response with an error message.
 * If the user is successfully logged in, it sends a 200 response with the access and refresh tokens.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A 200 response with the access and refresh tokens if the user is successfully logged in.
 * @throws A 400 response with an error message if the user does not exist or the password is incorrect or the request body is invalid.
 * @throws A 500 response if an error occurs during the login process.
 */
router.post('/login', validateRequest(loginSchema), asyncHandler(async (req: Request, res: Response) => {
  const cookies = req.cookies;
  try {
    // console.log(req.body, "req.body in login");
    const validateData = loginSchema.parse(req.body);
    // console.log(validateData);
    const { email, password } = validateData;

    const user = await findUserByEmail(email);

    if (!user || !(await comparePasswords(password, user.password))) {
      console.log('Invalid email or password');
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateTokens(user, uuidv4());
    // console.log(token, "token in login");

    // Ensure user.refreshTokens is not used
    let newRefreshTokenArray = !cookies?.jwt
      ? user.refreshTokens ?? []
      : (user.refreshTokens ?? []).filter(rt => rt !== cookies.jwt);

    // console.log(newRefreshTokenArray, "newRefreshTokenArray");
    // console.log(cookies.jwt, "cookies.jwt");

    if (cookies?.jwt) {
      console.log("cookies.jwt", cookies.jwt);
      /* 
      Scenario added here: 
          1) User logs in but never uses RT and does not logout 
          2) RT is stolen
          3) If 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */
      const refreshToken = cookies.jwt;
      const foundToken = await findRefreshTokenById(refreshToken);

      // Detected refresh token reuse!
      if (!foundToken) {
        // clear out ALL previous refresh tokens
        newRefreshTokenArray = [];
      }

      // save the new refresh token
      user.refreshTokens = [...newRefreshTokenArray, refreshToken];

      await updateRefreshToken(user.id, token.refreshToken);

      // set the refresh and access tokens in the response cookies
      // res.cookie('token', token.accessToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   expires: new Date(Date.now() + 1000 * 30), // 30 seconds
      // });

      // // set the refresh and access tokens in the response cookies
      // res.cookie('refresh', token.refreshToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === 'production',
      //   sameSite: 'strict',
      //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
      // });

      res.setHeader('Set-Cookie', [`token=${token.accessToken}; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(Date.now() + 1000 * 30).toUTCString()}`, `refresh=${token.refreshToken}; HttpOnly; Secure; SameSite=Strict; Expires=${new Date(Date.now() + 1000 * 60 * 60 * 24).toUTCString()}`]);

      return res.status(200).json({
        message: 'Logged in successfully.',
        accessToken: token.accessToken,
      });
    }

    console.log("newRefreshTokenArray after if statement", newRefreshTokenArray);

    // set the refresh and access tokens in the response cookies
    res.cookie('token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
    });

    // set the refresh and access tokens in the response cookies
    res.cookie('refresh', token.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    });

    return res.status(200).json({
      message: 'Logged in successfully.',
      accessToken: token.accessToken,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    } else {
    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  }
}));

interface RefreshTokenRequestBody {
  refreshToken: string;
}

/* Logs out a user by revoking all refresh tokens associated with the user.
* If the user is successfully logged out, it sends a 200 response.
* @param req - The request object.
* @param res - The response object.
* @returns A 200 response if the user is successfully logged out.
* @throws A 500 response if an error occurs during the logout process.
* */

router.post('/logout', isAuthenticated, async (req: Request, res: Response) => {
  // console.log("i am in logout");

  const refreshToken = req.cookies.refresh;
  // console.log(req.payload, "req.payload in logout");
  // console.log(req.body, "req.body in logout");

  let token = '';

  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.body?.token) {
    token = req.body.token;
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // if (!token) {

  //   return res.status(401).json({ message: 'Unauthorized' });
  // }

  // console.log(refreshToken, "refreshToken in logout");

  if (req.payload && req.payload.userId) {
    const userId = req.payload.userId;
    try {

      await revokeTokens(userId);
      // Remove token and refresh token from the response cookies if they exist
      if (token) clearCookies(res, ['token']);
      if (refreshToken) clearCookies(res, ['refresh']);
      return res.status(200).json({ message: 'Logged out successfully.' });

    } catch (error) {
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  } else if (refreshToken) {
    try {
      // If access token is not present, we can still revoke the refresh token
      await revokeTokens(refreshToken);

      // Remove refresh token from the response cookies if it exists
      clearCookies(res, ['refresh']);
      return res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred. Please try again later.' });
    }
  } else {

    return res.status(400).json({ message: 'Invalid request.' });
  }
});

router.post('/refreshToken', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refresh;

    // Check for presence of refresh token
    if (!refreshToken) {
      // console.log('Refresh token not found in cookies');
      return res.status(400).json({ message: 'Refresh token is required.' });
    }
    // console.log("Refresh token found in cookies");
    // Verify JWT secret
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      console.error('JWT_REFRESH_SECRET not found in environment variables.');
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // console.log("JWT_REFRESH_SECRET found in environment variables");

    // Verify the refresh token
    const payload = jwt.verify(refreshToken, secret) as { jti: string; userId: string };
    const savedRefreshToken = await findRefreshTokenById(payload.jti);
    console.log("check payload by get it from refreshToken", payload);

    console.log("checking savedRefreshToken by get it from savedRefreshToken", savedRefreshToken);

    // Check if the refresh token is valid and not revoked
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      // console.log('Refresh token not found or revoked');
      // console.log(savedRefreshToken, "savedRefreshToken");
      // console.log(!savedRefreshToken, "!savedRefreshToken");
      // console.log(savedRefreshToken?.revoked, "savedRefreshToken.revoked");
      // console.log("Send 401 response with message: Unauthorized");
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // console.log("Refresh token is valid and not revoked");

    // Check token hash
    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      // console.log('Hashed token does not match');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // console.log("Hashed token matches");

    // Find the user
    const user = await findUserById(payload.userId);
    if (!user) {

      // console.log('User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // console.log("User found");

    // Delete old refresh token and generate new ones
    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    // console.log("Old refresh token deleted and new ones generated");

    // Set new tokens in cookies
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 30), // 30 seconds
    });

    res.cookie('refresh', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
    });

    // console.log("New tokens set in cookies");

    // Return the new tokens
    return res.json({
      accessToken,
      refreshToken: newRefreshToken
    });

    // console.log("New tokens returned");
  } catch (err) {
    // Handle error and avoid sending multiple responses
    if (res.headersSent) {
      // Log the error and continue to the next middleware
      console.error('Headers already sent', err);
      return next(err);
    }

    // Log error (a)
    console.error('An error occurred in /refreshToken', err);

    // Send generic error response
    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
  }
});

// Endpoint to get user profile details or all users based on role
router.get('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    if (req.payload && req.payload.userId) {
      const user = await getUserDetails(req.payload.userId);
      if (user) {
        // Check if user is an admin
        if (user.IsAdmin) {
          const user = await getUserDetails(req.payload.userId);
          // If admin, return the list of all users
          const users = await getAllUsers();
          return res.status(200).json({ users, user });
        } else {
          // If not admin, return details of the authenticated user
          return res.status(200).json({ user });
        }
      } else {
        return res.status(404).json({ message: 'User not found.' });
      }
    }
    return res.status(400).json({ message: 'Invalid request.' });
  } catch (error) {
    console.error('Error fetching user details or user list:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = { auth: router };