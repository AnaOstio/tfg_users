import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import User from '../models/user.model';
import Logger from '../config/logger';

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Ejecutando middleware de autenticación');
    try {
        console.log('Middleware de autenticación ejecutado');
        console.log('Headers de la solicitud:', req.headers.authorization?.split(' ')[1]);
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            Logger.warn('Intento de acceso no autorizado - Token no proporcionado');
            res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación' });
            return;
        }

        const decoded = verifyToken(token);
        Logger.debug(`Token decodificado para el usuario ID: ${decoded.id}`);

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            Logger.error(`Usuario no encontrado con ID: ${decoded.id}`);
            res.status(401).json({ success: false, message: 'Usuario no encontrado' });
            return;
        }

        Logger.info(`Usuario autenticado: ${user.email} (ID: ${user._id})`);
        (req as any).user = user;
        next();
    } catch (error: any) {
        Logger.error(`Error de autenticación: ${error.message}`);
        res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
};