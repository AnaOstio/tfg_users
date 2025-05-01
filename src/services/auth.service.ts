import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, SESSION_EXPIRATION, ERROR_MESSAGES } from '../utils/constants';
import User from '../models/user.model';
import { IUser } from '../models/user.model';

export const registerUser = async (email: string, password: string): Promise<IUser> => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error(ERROR_MESSAGES.USER_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    return await user.save();
};

export const loginUser = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: SESSION_EXPIRATION });
    return { user, token };
};

export const logoutUser = (token: string): void => {
    // En una implementación real, podrías agregar el token a una lista negra aquí
    // Para este ejemplo, simplemente dejamos que el token expire
};