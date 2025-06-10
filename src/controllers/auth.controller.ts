import { Request, Response } from 'express';
import authService from '../services/auth.service';
import Logger from '../config/logger';
import { validateEmail } from '../utils/email.validator';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, confirmPassword } = req.body;

        if (!email || !password || !confirmPassword) {
            Logger.warn('Intento de registro con campos faltantes');
            throw new Error('Todos los campos son obligatorios');
        }

        if (!validateEmail(email)) {
            Logger.warn(`Email no válido: ${email}`);
            throw new Error('El correo electrónico no cumple con el estándar ECORR');
        }

        if (password !== confirmPassword) {
            Logger.warn('Las contraseñas no coinciden en el registro');
            throw new Error('Las contraseñas no coinciden');
        }

        const existingUser = await authService.getUserByEmail(email);
        if (existingUser) {
            Logger.warn(`Intento de registro con email existente: ${email}`);
            throw new Error('El correo electrónico ya está en uso');
        }

        const { user, token } = await authService.register(email, password, confirmPassword);

        res.status(201).json({
            success: true,
            data: { user, token }
        });
    } catch (error: any) {
        Logger.error(`Error en registro: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.login(email, password);

        res.status(200).json({
            success: true,
            data: { user, token }
        });
    } catch (error: any) {
        Logger.error(`Error en login: ${error.message}`);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyTokenNext = async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Token válido',
        user: (req as any).user
    });
};