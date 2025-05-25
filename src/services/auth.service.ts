import User from '../models/user.model';
import { generateToken } from '../config/jwt';
import { validateEmail } from '../utils/email.validator';
import Logger from '../config/logger';
import { IUser } from '../interfaces/user.inteface';

class AuthService {
    async register(email: string, password: string, confirmPassword: string): Promise<{ user: any; token: string }> {
        Logger.debug(`Intentando registrar usuario con email: ${email}`);

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

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            Logger.warn(`Intento de registro con email existente: ${email}`);
            throw new Error('El correo electrónico ya está en uso');
        }

        const user = await User.create({
            email,
            password,
            role: 'user',
            accountStatus: 'activated'
        });

        Logger.info(`Nuevo usuario registrado: ${email} (ID: ${user._id as string})`);

        const token = generateToken((user._id as string).toString());
        Logger.debug(`Token generado para usuario ID: ${user._id as string}`);

        return { user, token };
    }

    async login(email: string, password: string): Promise<{ user: any; token: string }> {
        Logger.debug(`Intento de login para email: ${email}`);

        if (!email || !password) {
            Logger.warn('Intento de login con campos faltantes');
            throw new Error('Correo electrónico y contraseña son obligatorios');
        }

        const user = await User.findOne({ email });
        if (!user) {
            Logger.warn(`Intento de login con email no encontrado: ${email}`);
            throw new Error('Usuario no encontrado');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            Logger.warn(`Contraseña incorrecta para usuario: ${email}`);
            throw new Error('Credenciales inválidas');
        }

        Logger.info(`Usuario logueado correctamente: ${email} (ID: ${user._id})`);
        const token = generateToken((user._id as string).toString());
        return { user, token };
    }

    async logout(token: string): Promise<void> {
        Logger.debug(`Solicitud de logout para token: ${token?.substring(0, 10)}...`);
        return Promise.resolve();
    }
}

export default new AuthService();