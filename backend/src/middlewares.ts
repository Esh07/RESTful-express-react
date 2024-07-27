import jwt, {JwtPayload} from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express';
import { Payload as PayLoad} from './api/users/users.routes';

interface Payload extends JwtPayload {
    userId: string;
    payload?: string;
}

interface CustomRequest extends Request {
    payload?: Payload;
}

function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

/* eslint-disable no-unused-vars */
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    /* eslint-enable no-unused-vars */
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
}

function isAuthenticated(req: CustomRequest, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(401).json({ message: '🚫 Un-Authorized 🚫' });
        return;
    }

    const secret = process.env.JWT_ACCESS_SECRET as string;
    if (!secret) {
        res.status(500).json({ message: 'Internal Server Error' });
        return;
    }

    try {
        const token = authorization.split(' ')[1];
        const payload = jwt.verify(token, secret) as JwtPayload;
        req.payload = payload as Payload;
        next();

    } catch (err) {
        res.status(401);
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: 'Token has  been expired' });
        }
        else {
            res.json({ message: '🚫 Un-Authorized 🚫' });
        }
    }

    return next();
}

module.exports = {
    notFound,
    errorHandler,
    isAuthenticated
};