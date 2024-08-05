import { Request, Response, NextFunction } from "express";
import { findUserById } from "../src/api/users/users.services";

interface RequestWithPayload extends Request {
    payload?: { userId: string };
}

export const isAdmin = async (req: RequestWithPayload, res: Response, next: NextFunction) => {
    try {
        const userId = req.payload?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const user = await findUserById(userId);

        if (!user || !user.IsAdmin) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        next();
    } catch (error) {
        console.error('Error checking admin role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};