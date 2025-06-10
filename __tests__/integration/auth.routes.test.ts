import request from 'supertest';
import app from '../../src/app';
import { connect, clearDatabase, closeDatabase } from '../setup';

beforeAll(() => connect());
afterEach(() => clearDatabase());
afterAll(() => closeDatabase());

describe('POST /api/auth/register (integration)', () => {
    it('creates a user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data).toHaveProperty('token');
    });

    it('returns 400 if passwords do not match', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'different' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Las contraseñas no coinciden');
    });

    it('returns 400 if email is already registered', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });
        expect(res.status).toBe(400);
        expect(res.body.message).toBe('El correo electrónico ya está en uso');
    });
});

describe('POST /api/auth/login (integration)', () => {
    it('returns 200, correct login', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@email.com', password: 'secret' });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('token');
    });

    it('returns 401 if user don`t exist', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@email.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Usuario no encontrado');
    });

    it('returns 401 if password is incorrect', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@email.com', password: 'wrongpassword' });
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Credenciales inválidas');
    });
});

describe('GET /api/auth/verify-token (integration)', () => {
    it('returns 200 if token is valid', async () => {
        const registerRes = await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });
        const token = registerRes.body.data.token;
        const res = await request(app)
            .get('/api/auth/verify-token')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.user).toHaveProperty('_id');
        expect(res.body.user.email).toBe('bob@email.com');
    });

    it('returns 401 if token is invalid', async () => {
        const res = await request(app)
            .get('/api/auth/verify-token')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Token inválido o expirado');
        expect(res.body.success).toBe(false);
    });
    it('returns 401 if no token is provided', async () => {
        const res = await request(app)
            .get('/api/auth/verify-token');
        expect(res.status).toBe(401);
        expect(res.body.message).toBe('No se proporcionó token de autenticación');
        expect(res.body.success).toBe(false);
    });
});
