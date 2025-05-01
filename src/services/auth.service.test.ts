import { registerUser, loginUser } from '../services/auth.service';
import User from '../models/user.model';
import { ERROR_MESSAGES } from '../utils/constants';

describe('Auth Service', () => {
    describe('registerUser', () => {
        it('should register a new user', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            const user = await registerUser(email, password);

            expect(user).toBeDefined();
            expect(user.email).toBe(email);
            expect(user.password).not.toBe(password); // Password should be hashed
        });

        it('should throw error if email already exists', async () => {
            const email = 'test@example.com';
            const password = 'password123';

            await registerUser(email, password);

            await expect(registerUser(email, 'anotherpassword'))
                .rejects
                .toThrow(ERROR_MESSAGES.USER_EXISTS);
        });
    });

    describe('loginUser', () => {
        const email = 'test@example.com';
        const password = 'password123';

        beforeEach(async () => {
            await registerUser(email, password);
        });

        it('should login with correct credentials', async () => {
            const { user, token } = await loginUser(email, password);

            expect(user).toBeDefined();
            expect(user.email).toBe(email);
            expect(token).toBeDefined();
        });

        it('should throw error for incorrect password', async () => {
            await expect(loginUser(email, 'wrongpassword'))
                .rejects
                .toThrow(ERROR_MESSAGES.INVALID_CREDENTIALS);
        });

        it('should throw error for non-existent email', async () => {
            await expect(loginUser('nonexistent@example.com', password))
                .rejects
                .toThrow(ERROR_MESSAGES.USER_NOT_FOUND);
        });
    });
});