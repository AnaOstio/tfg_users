import request from 'supertest';
import app from '../app';
import User from '../models/user.model';
import Permission from '../models/permission.model';
import { getAuthToken } from '../tests/setup';
import { PermissionType, ResourceType } from '../models/permission.model';

describe('Permission Controller', () => {
    let creatorId: string;
    let targetId: string;
    let token: string;

    beforeEach(async () => {
        await User.deleteMany({});
        await Permission.deleteMany({});

        const creator = await User.create({
            email: 'creator@test.com',
            password: 'hashedpassword'
        });

        const target = await User.create({
            email: 'target@test.com',
            password: 'hashedpassword'
        });

        creatorId = creator._id.toString();
        targetId = target._id.toString();
        token = getAuthToken(creatorId);
    });

    it('should list available permissions', async () => {
        const res = await request(app)
            .get('/api/permissions/available')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.permissions).toContain(PermissionType.EDITAR);
        expect(res.body.permissions).toContain(PermissionType.ELIMINAR);
    });

    it('should search user by email', async () => {
        const res = await request(app)
            .get('/api/permissions/search-user')
            .query({ email: 'target@test.com' })
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.user.email).toBe('target@test.com');
    });

    it('should assign permissions to user', async () => {
        const res = await request(app)
            .post('/api/permissions/assign')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: targetId,
                resourceId: 'memoria123',
                permissions: [PermissionType.EDITAR]
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Permisos asignados correctamente');
        expect(res.body.data.permissions).toContain(PermissionType.EDITAR);
    });

    it('should revoke permissions from user', async () => {
        await Permission.create({
            userId: targetId,
            resourceId: 'memoria123',
            resourceType: ResourceType.THESIS,
            permissions: [PermissionType.ELIMINAR],
            grantedBy: creatorId
        });

        const res = await request(app)
            .post('/api/permissions/revoke')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: targetId,
                resourceId: 'memoria123'
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Permisos revocados correctamente');
    });

    it('should return error for invalid assign data', async () => {
        const res = await request(app)
            .post('/api/permissions/assign')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: '',
                resourceId: '',
                permissions: []
            });

        expect(res.status).toBe(400);
    });

    it('should return 400 if email is missing or invalid', async () => {
        const res = await request(app)
            .get('/api/permissions/search-user')
            .query({ email: '' }) // Email vacío
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email inválido');
    });

    it('should return 500 if assignPermissions throws error', async () => {
        const res = await request(app)
            .post('/api/permissions/assign')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: 'invalid-id-format',
                resourceId: 'memoria123',
                permissions: [PermissionType.EDITAR]
            });

        expect(res.status).toBe(500);
        expect(res.body.error).toBeDefined();
    });

    it('should return 400 if revoke request is missing data', async () => {
        const res = await request(app)
            .post('/api/permissions/revoke')
            .set('Authorization', `Bearer ${token}`)
            .send({
                userId: ''
                // Falta resourceId
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Datos de entrada inválidos');
    });
});
