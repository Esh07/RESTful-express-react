import { Request, Response, NextFunction } from "express";
import { z, ZodObject, ZodRawShape, ZodSchema, ZodString } from "zod";
const jwt = require('jsonwebtoken');
import cookie from 'cookie';
import { isAuthenticated, checkAlreadyAuthenticated } from '../../middlewares';

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { generateTokens } = require('../../lib/jwt');

const { comparePasswords } = require('../../utils/authUtils');

import { hashToken } from '../../lib/hashToken';

const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  findUserById,
  revokeTokens,
} = require('./auth.services');
// const jwt = require('jsonwebtoken');


const router = express.Router();

const {
  findUserByEmail,
  createUserByEmailAndPassword,
  deleteRefreshToken
} = require('../users/users.services');

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
  try {
    const validateData = loginSchema.parse(req.body);
    console.log(validateData);
    const { email, password } = validateData;

    const user = await findUserByEmail(email);

    if (!user || !(await comparePasswords(password, user.password))) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateTokens(user, uuidv4());

    res.setHeader('Set-Cookie', cookie.serialize('token', token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    }));

    return res.status(200).json({ message: 'Logged in successfully.' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'An error occurred. Please try again later.' });
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
  if (req.payload && req.payload.userId) {
    const userId = req.payload.userId;
    await revokeTokens(userId);
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully.' });
  } else {
    return res.status(400).json({ message: 'Invalid request.' });
  }
});


router.post('/refreshToken', async (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    // 401 Unauthorised: Invalid or revoked refresh token
    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      return res.status(401).json({ message: 'Unauthorized' });
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    // 401 Unauthorised: Token mismatch
    if (hashedToken !== savedRefreshToken.hashedToken) {
      return res.status(401).json({ message: 'Unauthorized' });
      throw new Error('Unauthorized');
    }

    const user = await findUserById(payload.userId);
    // 401 Unauthorized: User not found
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    // Return the new tokens
    return res.json({
      accessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    next(err);
  }
});

// Generic error handler Middleware
// router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     console.error(err);
//     res.status(500).send('An error occurred. Please try again later.');
//   }
// );

module.exports = { auth: router };