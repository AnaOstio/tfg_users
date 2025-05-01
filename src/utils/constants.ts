import dotenv from 'dotenv';
dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/user_management';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'session_secret';
export const SESSION_EXPIRATION = 60 * 60 * 1000; // 1 hora en milisegundos

export const PORT = process.env.PORT || 3000;

export const ROL_DEFECTO = 'USER';
export const ESTADO_CUENTA = {
    ACTIVO: 'ACTIVO',
    INACTIVO: 'INACTIVO',
    BLOQUEADO: 'BLOQUEADO'
};

export const ERROR_MESSAGES = {
    EMAIL_REQUIRED: 'El correo electrónico es obligatorio',
    EMAIL_INVALID: 'El correo electrónico no cumple con el estándar ECORR',
    PASSWORD_REQUIRED: 'La contraseña es obligatoria',
    PASSWORD_CONFIRMATION_REQUIRED: 'La confirmación de contraseña es obligatoria',
    PASSWORDS_NOT_MATCH: 'Las contraseñas no coinciden',
    USER_EXISTS: 'Ya existe un usuario con este correo electrónico',
    USER_NOT_FOUND: 'Usuario no encontrado',
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    UNAUTHORIZED: 'No autorizado',
    PERMISSION_DENIED: 'Permiso denegado',
    THESIS_NOT_FOUND: 'Memoria de título no encontrada',
    PERMISSION_ALREADY_GRANTED: 'El permiso ya ha sido otorgado'
};