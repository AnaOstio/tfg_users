import { isEmail } from 'validator';
import { ERROR_MESSAGES } from './constants';

export const validateEmail = (email: string): string | null => {
    if (!email) return ERROR_MESSAGES.EMAIL_REQUIRED;
    if (!isEmail(email)) return ERROR_MESSAGES.EMAIL_INVALID;
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) return ERROR_MESSAGES.PASSWORD_REQUIRED;
    return null;
};

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null => {
    if (!confirmation) return ERROR_MESSAGES.PASSWORD_CONFIRMATION_REQUIRED;
    if (password !== confirmation) return ERROR_MESSAGES.PASSWORDS_NOT_MATCH;
    return null;
};