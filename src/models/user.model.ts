import bcrypt from 'bcryptjs';
import { Schema, model, Document } from 'mongoose';
import { ROL_DEFECTO, ESTADO_CUENTA } from '../utils/constants';

export interface IUser extends Document {
    email: string;
    password: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { type: String, required: true },
    role: { type: String, default: ROL_DEFECTO },
    status: { type: String, default: ESTADO_CUENTA.ACTIVO },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre<IUser>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default model<IUser>('User', UserSchema);