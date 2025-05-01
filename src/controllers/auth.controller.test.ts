import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
import { ERROR_MESSAGES } from '../utils/constants';

describe('Auth Controller', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /register', () => {
        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    passwordConfirmation: 'password123'
                });

            expect(response.status).toBe(201);
            expect(response.body.user.email).toBe('test@example.com');
            expect(response.body.token).toBeDefined();
        });

        it('should return 400 for invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123',
                    passwordConfirmation: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(ERROR_MESSAGES.EMAIL_INVALID);
        });

        it('should return 400 for missing password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: '',
                    passwordConfirmation: ''
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(ERROR_MESSAGES.PASSWORD_REQUIRED);
        });

        it('should return 400 for password mismatch', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    passwordConfirmation: 'differentpassword'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(ERROR_MESSAGES.PASSWORDS_NOT_MATCH);
        });

        it('should return 400 for duplicate email', async () => {
            // Primer registro
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    passwordConfirmation: 'password123'
                });

            // Segundo intento con mismo email
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    passwordConfirmation: 'password123'
                });

            expect(response.status).toBe(400);
            expect(response.body.error).toBe(ERROR_MESSAGES.USER_EXISTS);
        });
    });

    describe('POST /login', () => {
        const testUser = {
            email: 'test@example.com',
            password: 'password123'
        };

        beforeEach(async () => {
            await request(app)
                .post('/api/auth/register')
                .send({
                    ...testUser,
                    passwordConfirmation: testUser.password
                });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send(testUser);

            expect(response.status).toBe(200);
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.token).toBeDefined();
        });

        it('should return 401 for incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
        });

        it('should return 401 for non-existent user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });

            expect(response.status).toBe(401);
            expect(response.body.error).toBe(ERROR_MESSAGES.USER_NOT_FOUND);
        });
    });

    describe('POST /logout', () => {
        it('should logout successfully with valid token', async () => {
            // Primero registramos un usuario
            const registerResponse = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    passwordConfirmation: 'password123'
                });

            // Luego hacemos logout con el token recibido
            const token = registerResponse.body.token;
            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Sesión cerrada exitosamente');
        });

        it('should handle logout without token', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Sesión cerrada exitosamente');
        });
    });
});