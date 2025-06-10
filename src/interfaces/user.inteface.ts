import mongoose from "mongoose";

export interface IUser {
    email: string;
    password: string;
    role: string;
    accountStatus: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUserDocument extends IUser, mongoose.Document {
    comparePassword(password: string): Promise<boolean>;
}

export interface IUserModel extends IUser, IUserDocument {
    _id: unknown;
}