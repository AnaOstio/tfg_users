import request from 'supertest';
import app from '../../src/app';
import { connect, clearDatabase, closeDatabase } from '../setup';
import mongoose from 'mongoose';
import { MemoryModel } from '../helper/memory.model';
import User from '../../src/models/user.model';
import jwt from 'jsonwebtoken';

describe('Permissions routes (integration)', () => {
    let ownerToken: string;
    let otherOwnerToken: string;
    let ownerId: string;
    let otherUserId: string;
    let otherUserEmail: string;
    let memoryId: string;

    beforeAll(async () => {
        await connect();

        // Creo el owner
        const owner = await User.create({ email: 'owner@example.com', password: 'secret' });
        ownerId = (owner._id as unknown as string).toString();
        ownerToken = jwt.sign({ id: ownerId }, 'your-secret-key', { expiresIn: '1h' });

        // Creo el otro usuario
        const otherUser = await User.create({ email: 'other@example.com', password: 'secret' });
        otherUserId = (otherUser._id as unknown as string).toString();
        otherUserEmail = otherUser.email;
        otherOwnerToken = jwt.sign({ id: otherUserId }, 'your-secret-key', { expiresIn: '1h' });

        // Creo una memoria
        const memory = await MemoryModel.create({
            title: 'Test Memory',
            content: 'Contenido de prueba',
            owner: ownerId
        });
        memoryId = (memory._id as unknown as string).toString();
    });

    afterAll(async () => {
        await clearDatabase();
        await closeDatabase();
    });

    describe('GET /api/users/search', () => {
        it('debe devolver usuarios cuyos emails coincidan', async () => {
            const res = await request(app)
                .get('/api/users/search')
                .query({ email: 'other' })
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.some((u: any) => u.email === otherUserEmail)).toBe(true);
        });

        it('debe devolver 400 si falta el query param email', async () => {
            const res = await request(app)
                .get('/api/users/search')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/permissions', () => {
        it('debe devolver los permisos del usuario autenticado (vacío inicialmente)', async () => {
            const res = await request(app)
                .get('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('debe devolver 401 si no envías token', async () => {
            const res = await request(app).get('/api/permissions');
            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/permissions', () => {
        it('debe asignar permisos a otro usuario', async () => {
            const res = await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                // ojo: el controlador usa getUserByEmail, así que enviamos el email, no el ID
                .send({
                    memoryId,
                    userId: otherUserEmail,
                    permissions: ['Edición']
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('debe devolver 400 si falta el campo permissions o está vacío', async () => {
            const res = await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserEmail,
                    permissions: []
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/permissions', () => {
        it('debe revocar permisos de un usuario', async () => {
            // primero aseguro que tiene el permiso
            await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserEmail,
                    permissions: ['Edición']
                });

            const res = await request(app)
                .delete('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserId,
                    permissionsToRevoke: ['Edición']
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('debe devolver 400 si falta el campo permissionsToRevoke o está vacío', async () => {
            const res = await request(app)
                .delete('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserId
                });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/permissions/getByMemoryIds', () => {
        it('debe devolver permisos por IDs de memoria', async () => {
            // aseguro que hay al menos un permiso
            await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserEmail,
                    permissions: ['Edición']
                });

            const res = await request(app)
                .post('/api/permissions/getByMemoryIds')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send([memoryId]);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });

    describe('GET /api/permissions/getByUserId', () => {
        it('debe devolver permisos por ID de usuario', async () => {
            const res = await request(app)
                .get('/api/permissions/getByUserId')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });
    });
});
