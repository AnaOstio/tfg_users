import * as PermissionService from '../services/permission.service';
import User from '../models/user.model';
import Permission from '../models/permission.model';
import { PermissionType, ResourceType } from '../models/permission.model';

describe('Permission Service', () => {
    let creatorId: string;
    let targetId: string;

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
    });

    it('should return available permissions', () => {
        const perms = PermissionService.getAvailablePermissions();
        expect(perms).toEqual(expect.arrayContaining([PermissionType.EDITAR, PermissionType.ELIMINAR]));
    });

    it('should find user by email', async () => {
        const user = await PermissionService.findUserByEmail('target@test.com');
        expect(user).toBeDefined();
        expect(user?.email).toBe('target@test.com');
    });

    it('should assign permissions', async () => {
        const result = await PermissionService.assignPermissions({
            userId: targetId,
            resourceId: 'memoria123',
            resourceType: ResourceType.THESIS,
            permissions: [PermissionType.EDITAR],
            grantedBy: creatorId
        });

        expect(result.userId.toString()).toBe(targetId);
        expect(result.permissions).toContain(PermissionType.EDITAR);
    });

    it('should revoke permissions', async () => {
        await PermissionService.assignPermissions({
            userId: targetId,
            resourceId: 'memoria123',
            resourceType: ResourceType.THESIS,
            permissions: [PermissionType.ELIMINAR],
            grantedBy: creatorId
        });

        await PermissionService.revokePermissions({
            userId: targetId,
            resourceId: 'memoria123',
            resourceType: ResourceType.THESIS
        });

        const perm = await Permission.findOne({ userId: targetId });
        expect(perm).toBeNull();
    });
});
