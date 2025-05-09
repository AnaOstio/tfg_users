import { NextFunction, Request, Response } from 'express';
import { registerUser, loginUser, logoutUser } from '../services/auth.service';
import { validateEmail, validatePassword, validatePasswordConfirmation } from '../utils/validators';
import { ERROR_MESSAGES } from '../utils/constants';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, passwordConfirmation } = req.body;

        // Validaciones
        const emailError = validateEmail(email);
        if (emailError) return res.status(400).json({ error: emailError });

        const passwordError = validatePassword(password);
        if (passwordError) return res.status(400).json({ error: passwordError });

        const passwordConfirmationError = validatePasswordConfirmation(password, passwordConfirmation);
        if (passwordConfirmationError) return res.status(400).json({ error: passwordConfirmationError });

        // Registrar usuario
        const user = await registerUser(email, password);

        // Iniciar sesión automáticamente después del registro
        const { token } = await loginUser(email, password);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            token
        });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const { user, token } = await loginUser(email, password);

        res.json({
            message: 'Inicio de sesión exitoso',
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                status: user.status
            },
            token
        });
    } catch (error: any) {
        res.status(401).json({ error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            logoutUser(token);
        }
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
};

export const verifyToken = async (req: Request, res: Response) => {
    return res.status(200).json({
        success: true,
        message: 'Token válido',
        user: (req as any).user
    });
};