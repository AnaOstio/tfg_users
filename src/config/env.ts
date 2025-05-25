
import dotenv from 'dotenv';
dotenv.config();


export const PORT = process.env.PORT || 3000;

if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI no está definida en el archivo .env');
}

export const MONGODB_URI = process.env.MONGODB_URI as string;
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = 3600;
export const NODE_ENV = process.env.NODE_ENV || 'development';
