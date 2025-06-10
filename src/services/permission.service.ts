import Permission from '../models/permission.model';
import User from '../models/user.model';
import { PermissionType } from '../interfaces/permission.interface';
import Logger from '../config/logger';
import { getPermissionByMemoriesIds } from '../controllers/permission.controller';

interface SearchUsersParams {
    email: string;
    page: number;
    pageSize: number;
}

class PermissionService {
    async assignPermissions(
        memoryId: string,
        userId: string,
        assignedBy: string,
        permissions: PermissionType[]
    ): Promise<any> {
        Logger.debug(`Asignando permisos: memoria=${memoryId}, usuario=${userId}, asignador=${assignedBy}`);

        const user = await User.findById(userId);
        if (!user) {
            Logger.error(`Usuario no encontrado al asignar permisos: ID=${userId}`);
            throw new Error('Usuario no encontrado');
        }

        const assigner = await User.findById(assignedBy);
        if (!assigner) {
            Logger.error(`Asignador no encontrado: ID=${assignedBy}`);
            throw new Error('Usuario asignador no encontrado');
        }

        let permission = await Permission.findOne({ userId, memoryId });

        if (permission) {
            Logger.debug(`Permisos existentes encontrados, actualizando: ${permission._id}`);
            permission.permissions = [...new Set([...permission.permissions, ...permissions])];
            permission.updatedAt = new Date();
        } else {
            Logger.debug('Creando nuevos permisos');
            permission = new Permission({
                userId,
                assignedBy,
                memoryId,
                permissions,
            });
        }

        await permission.save();
        Logger.info(`Permisos asignados correctamente: ID=${permission._id}`);

        return permission;
    }

    async revokePermissions(
        memoryId: string,
        userId: string,
        permissionsToRevoke: PermissionType[]
    ): Promise<any> {
        Logger.debug(`Revocando permisos: memoria=${memoryId}, usuario=${userId}`);

        const permission = await Permission.findOne({ userId, memoryId });

        if (!permission) {
            Logger.warn(`No se encontraron permisos para revocar: memoria=${memoryId}, usuario=${userId}`);
            throw new Error('Permisos no encontrados');
        }

        permission.permissions = permission.permissions.filter(
            perm => !permissionsToRevoke.includes(perm as PermissionType)
        );

        if (permission.permissions.length === 0) {
            Logger.info(`Todos los permisos revocados, eliminando registro: ${permission._id}`);
            await Permission.deleteOne({ _id: permission._id });
            return null;
        }

        permission.updatedAt = new Date();
        await permission.save();
        Logger.info(`Permisos actualizados después de revocación: ID=${permission._id}`);

        return permission;
    }

    async getUserPermissions(userId: string, memoryId: string): Promise<PermissionType[]> {
        Logger.debug(`Consultando permisos para usuario=${userId}, memoria=${memoryId}`);
        const permission = await Permission.findOne({ userId, memoryId });
        return permission ? permission.permissions : [];
    }

    async searchUsersByEmail(params: SearchUsersParams): Promise<{
        page: number;
        pageSize: number;
        total: number;
        data: any[];
    }> {
        const { email, page, pageSize } = params;

        Logger.debug(`Buscando usuarios por email: "${email}", página: ${page}, tamaño página: ${pageSize}`);

        // Construimos el filtro para búsqueda por email (regex, case-insensitive)
        const filter: any = {
            email: { $regex: email, $options: 'i' },
        };

        // Calculamos cuántos documentos omitimos para paginar
        const skip = (page - 1) * pageSize;

        // Ejecutamos en paralelo la búsqueda paginada y el conteo total
        const [docs, total] = await Promise.all([
            User.find(filter)
                .select('-password')     // Excluimos el campo password
                .skip(skip)
                .limit(pageSize)
                .exec(),
            User.countDocuments(filter).exec(),
        ]);

        Logger.debug(`Usuarios encontrados (en total): ${total}. Usuarios devueltos en esta página: ${docs.length}`);

        return {
            page,
            pageSize,
            total,
            data: docs,
        };
    }
    async getPermissionByMemoriesIds(memoryIds: string[], userId: string): Promise<any[]> {
        Logger.debug(`Obteniendo permisos por IDs de memoria: ${memoryIds.join(', ')}`);
        const permissions = await Permission
            .find({
                userId: userId,
                memoryId: { $in: memoryIds },
            })
            .populate('assignedBy', '-password')
            .exec();
        Logger.info(`Permisos obtenidos: ${permissions.length} registros encontrados`);
        return permissions;
    }
}

export default new PermissionService();