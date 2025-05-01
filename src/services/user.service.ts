import User from '../models/user.model';
import { IUser } from '../models/user.model';
import { ERROR_MESSAGES } from '../utils/constants';

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
    return await User.findOne({ email });
};

export const getUserById = async (id: string): Promise<IUser | null> => {
    return await User.findById(id);
};