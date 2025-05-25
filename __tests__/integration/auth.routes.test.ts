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
});

describe('POST /api/auth/login (integration)', () => {
    it('issues a JWT', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ email: 'bob@email.com', password: 'secret', confirmPassword: 'secret' });

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'bob@email.com', password: 'secret' });

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveProperty('token');
    });
});
