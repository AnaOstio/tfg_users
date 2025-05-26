import permissionsService from '../../src/services/permission.service';
import Permission from '../../src/models/permission.model';
import User from '../../src/models/user.model';

jest.mock('../../src/models/user.model');
jest.mock('../../src/models/permission.model');

describe('PermissionService (unit)', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('assignPermissions', () => {
        const memoryId = 'mem1';
        const userId = 'user1';
        const assignedBy = 'admin1';
        const perms = ['Edición', 'Eliminar'] as any;

        it('lanza si no existe el usuario', async () => {
            (User.findById as jest.Mock).mockResolvedValueOnce(null);

            await expect(permissionsService.assignPermissions(memoryId, userId, assignedBy, perms))
                .rejects.toThrow('Usuario no encontrado');

            expect(User.findById).toHaveBeenCalledWith(userId);
        });

        it('lanza si no existe el asignador', async () => {
            (User.findById as jest.Mock)
                .mockResolvedValueOnce({ _id: userId })       // usuario existe
                .mockResolvedValueOnce(null);                 // asignador no existe

            await expect(permissionsService.assignPermissions(memoryId, userId, assignedBy, perms))
                .rejects.toThrow('Usuario asignador no encontrado');

            expect(User.findById).toHaveBeenNthCalledWith(2, assignedBy);
        });

        it('actualiza permisos existentes (hace merge único)', async () => {
            const existing = {
                _id: 'perm1',
                permissions: ['Edición'],
                save: jest.fn().mockResolvedValue(true),
            };
            // usuario y asignador válidos
            (User.findById as jest.Mock).mockResolvedValue({ _id: userId });
            (User.findById as jest.Mock).mockResolvedValue({ _id: assignedBy });
            (Permission.findOne as jest.Mock).mockResolvedValue(existing);

            const result = await permissionsService.assignPermissions(memoryId, userId, assignedBy, perms);

            // Hace merge único de ['Edición'] y ['Edición','Eliminar']
            expect(result.permissions.sort()).toEqual(['Edición', 'Eliminar'].sort());
            expect(existing.save).toHaveBeenCalled();
            expect(result).toBe(existing);
        });

        it('crea nuevos permisos si no existían', async () => {
            // usuario y asignador válidos
            (User.findById as jest.Mock).mockResolvedValue({ _id: userId });
            (User.findById as jest.Mock).mockResolvedValue({ _id: assignedBy });
            (Permission.findOne as jest.Mock).mockResolvedValue(null);

            // mock de constructor: new Permission(...)
            const fakeInstance = {
                userId, assignedBy, memoryId, permissions: perms.slice(),
                save: jest.fn().mockResolvedValue(true),
            };
            (Permission as unknown as jest.Mock).mockImplementation(() => fakeInstance);

            const result = await permissionsService.assignPermissions(memoryId, userId, assignedBy, perms);

            expect(Permission).toHaveBeenCalledWith({ userId, assignedBy, memoryId, permissions: perms });
            expect(fakeInstance.save).toHaveBeenCalled();
            expect(result).toBe(fakeInstance);
        });
    });

    describe('revokePermissions', () => {
        const memoryId = 'mem1';
        const userId = 'user1';

        it('lanza si no hay permisos que revocar', async () => {
            (Permission.findOne as jest.Mock).mockResolvedValue(null);

            await expect(permissionsService.revokePermissions(memoryId, userId, ['Edición'] as any))
                .rejects.toThrow('Permisos no encontrados');
        });

        it('revoca permisos parciales y guarda', async () => {
            const before = {
                _id: 'perm1',
                permissions: ['Edición', 'Eliminar'],
                save: jest.fn().mockResolvedValue(true),
            };
            (Permission.findOne as jest.Mock).mockResolvedValue(before);

            const result = await permissionsService.revokePermissions(memoryId, userId, ['Edición'] as any);

            expect(result).toBe(before);
            expect(before.permissions).toEqual(['Eliminar']);
            expect(before.save).toHaveBeenCalled();
            expect(Permission.deleteOne).not.toHaveBeenCalled();
        });

        it('si revoca todo, elimina el documento y devuelve null', async () => {
            const before = {
                _id: 'perm1',
                permissions: ['Edición'],
                save: jest.fn(),
            };
            (Permission.findOne as jest.Mock).mockResolvedValue(before);
            (Permission.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            const result = await permissionsService.revokePermissions(memoryId, userId, ['Edición'] as any);

            expect(Permission.deleteOne).toHaveBeenCalledWith({ _id: 'perm1' });
            expect(result).toBeNull();
        });
    });

    describe('getUserPermissions', () => {
        it('retorna arreglo vacío si no hay permisos', async () => {
            (Permission.findOne as jest.Mock).mockResolvedValue(null);

            const perms = await permissionsService.getUserPermissions('u', 'm');
            expect(perms).toEqual([]);
        });

        it('retorna los permisos si existen', async () => {
            const fake = { permissions: ['Edición', 'Eliminar'] };
            (Permission.findOne as jest.Mock).mockResolvedValue(fake);

            const perms = await permissionsService.getUserPermissions('u', 'm');
            expect(perms).toEqual(['Edición', 'Eliminar']);
        });
    });

    describe('searchUsersByEmail', () => {
        it('hace find con regex y select sin password', async () => {
            const fakeUsers = [{ _id: '1', email: 'a@b.com' }];
            const mockSelect = jest.fn().mockReturnValue(fakeUsers);
            (User.find as jest.Mock).mockReturnValue({ select: mockSelect });

            const res = await permissionsService.searchUsersByEmail('test');

            expect(User.find).toHaveBeenCalledWith({ email: { $regex: 'test', $options: 'i' } });
            expect(mockSelect).toHaveBeenCalledWith('-password');
            expect(res).toBe(fakeUsers);
        });
    });
});
