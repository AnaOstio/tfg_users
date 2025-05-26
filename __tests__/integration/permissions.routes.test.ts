import request from 'supertest';
import app from '../../src/app';
import { connect, clearDatabase, closeDatabase } from '../setup';
import mongoose from 'mongoose';
import { MemoryModel } from '../helper/memory.model';
import User from '../../src/models/user.model'; // Asegúrate de importar el modelo User
import jwt from 'jsonwebtoken';

describe('Permissions routes (integration)', () => {
    let ownerToken: string;
    let otherOwnerToken: string;
    let ownerId: string;
    let otherUserId: string;
    let memoryId: string;

    beforeAll(async () => {
        await connect();

        // Crear usuario owner directamente en la base de datos
        const owner = await User.create({
            email: 'owner@example.com',
            password: 'secret'
        });
        ownerId = (owner._id as mongoose.Types.ObjectId).toString();
        console.log(`Owner ID: ${ownerId}`);

        // Generar token manualmente para evitar problemas con el endpoint de registro
        ownerToken = jwt.sign({ id: ownerId }, 'your-secret-key', {
            expiresIn: 3600 // 1 hora
        });

        // Crear usuario other directamente
        const otherUser = await User.create({
            email: 'other@example.com',
            password: 'secret',
        });
        otherUserId = (otherUser._id as mongoose.Types.ObjectId).toString();

        otherOwnerToken = jwt.sign({ id: otherUserId }, 'your-secret-key', {
            expiresIn: 3600 // 1 hora
        });

        // Crear memory
        const memory = await MemoryModel.create({
            title: 'Test Memory',
            content: 'Contenido de prueba',
            owner: ownerId
        });
        memoryId = (memory._id as mongoose.Types.ObjectId).toString();
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
            expect(res.body.success).toBe(true);
            expect(res.body.data.some((u: any) => u.email === 'other@example.com')).toBe(true);
        });

        it('debe devolver 400 si falta el query param email', async () => {
            const res = await request(app)
                .get('/api/users/search')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/permissions/', () => {
        it('debe devolver los permisos de un usuario para una memoria específica', async () => {
            const res = await request(app)
                .get(`/api/permissions`)
                .set('Authorization', `Bearer ${otherOwnerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('debe devolver error 401 por no autizado', async () => {
            const res = await request(app)
                .get(`/api/permissions`)
                .set('Authorization', `Bearer `);

            expect(res.status).toBe(401);
        });
    });

    describe('POST /api/permissions', () => {
        it('debe asignar permisos a otro usuario', async () => {
            const res = await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserId,
                    assignedBy: ownerId,
                    permissions: ['Edición']
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBeDefined();
        });

        it('error falta los permisos', async () => {
            const res = await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserId,
                    assignedBy: ownerId,
                    permissions: []
                });

            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/permissions', () => {
        it('debe revocar permisos de un usuario', async () => {
            // Primero asignar permisos
            await request(app)
                .post('/api/permissions')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    memoryId,
                    userId: otherUserId,
                    assignedBy: ownerId,
                    permissions: ['Edición']
                });

            // Luego revocar
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
    });

    it('debe devolver 400 si intentas revocar permisos no existentes', async () => {
        const res = await request(app)
            .delete('/api/permissions')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                memoryId,
                userId: otherUserId,
                permissionsToRevoke: ['Edición']
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('error falta los permisos', async () => {
        const res = await request(app)
            .delete('/api/permissions')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({
                memoryId,
                userId: otherUserId,
                assignedBy: ownerId,
                permissions: []
            });

        expect(res.status).toBe(400);
    });
});