import { Request, Response, NextFunction } from "express";
import { z, ZodObject, ZodRawShape, ZodSchema, ZodString } from "zod";

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const { generateTokens } = require('../../lib/jwt');

const { comparePasswords } = require('../../utils/authUtils');

const {
  addRefreshTokenToWhitelist,
} = require('./auth.services');
// const jwt = require('jsonwebtoken');


const router = express.Router();

const {
  findUserByEmail,
  createUserByEmailAndPassword,
} = require('../users/user.services');

interface RegisterRequestBody {
    email: string;
    password: string;
    confirmPassword: string;
  }


const registerSchemaBase = z.object({
    email: z.string({ required_error: 'Email is required.',}).email().min(6),
    password: z.string({ required_error: 'Password is required.', invalid_type_error: 'Password must be a string.',}).min(6, { message: 'Password must be at least 6 characters long.' }),
    confirmPassword: z.string({ required_error: 'Confirm password is required.', invalid_type_error: 'Confirm password must be a string.',}),
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
  const validateRequest = (schema: z.ZodObject<any> ) => (req: Request, res: Response, next: NextFunction) => {
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
        }
        ).parse(parsedData);
      }

        // attach the parsed data to the request object
        req.body = parsedData;

        // proceed to the next middleware
        next();
        
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ errors: err.errors });
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
  const asyncHandler =  (fn: Function ) => (req: Request, res: Response, next: NextFunction) => {
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
router.post('/register', validateRequest(registerSchemaBase), asyncHandler(async(req:Request<{}, {}, RegisterRequestBody>, res: Response) => {

    const { email, password} = req.body;

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('User with this email already exists.');
    }

    const user = await createUserByEmailAndPassword({ email, password });
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(user, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: user.id });

    res.status(201).json({
      accessToken,
      refreshToken,
    });

}));

router.get('/login', (req: Request, res: Response) => {
    res.send('Login');
}
);

// Generic error handler Middleware
router.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send('An error occurred. Please try again later.');
  }
);

module.exports = { auth: router };