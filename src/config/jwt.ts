import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from './env';

interface JwtPayload {
    id: string;
}

export const generateToken = (userId: string): string => {
    const payload: JwtPayload = { id: userId };
    const options: jwt.SignOptions = {
        expiresIn: JWT_EXPIRES_IN,
    };

    return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
};

export const verifyToken = (token: string): any => {
    return jwt.verify(token, JWT_SECRET);
};