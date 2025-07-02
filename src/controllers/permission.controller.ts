import { Request, Response } from 'express';
import permissionService from '../services/permission.service';
import Logger from '../config/logger';
import { PermissionType } from '../interfaces/permission.interface';
import authService from '../services/auth.service';

export const assignPermissions = async (req: Request, res: Response) => {
    try {
        const { memoryId, userId, permissions } = req.body;

        Logger.debug(`Asignando permisos: memoria=${memoryId}, usuario=${userId}, permisos=${permissions} cnd usuario asignador=${(req as any).user}`);

        if (!memoryId || !userId || !permissions || !Array.isArray(permissions) || permissions.length === 0 || !(req as any).user) {
            Logger.error('Faltan datos necesarios para asignar permisos');
            throw new Error('Faltan datos necesarios para asignar permisos');
        }

        const permisosTraducidos = permissions.map(
            (perm) => PermissionType[perm as keyof typeof PermissionType]
        );

        const userAssigned = await authService.getUserByEmail(userId);
        if (!userAssigned) {
            Logger.error(`Usuario no encontrado: ${userId}`);
            throw new Error('Usuario no encontrado');
        }

        console.log(`Usuario asignado: `, userAssigned);


        const result = await permissionService.assignPermissions(
            memoryId,
            (userAssigned._id as string).toString(),
            (req as any).user._id,
            permisosTraducidos
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        Logger.error(`Error al asignar permisos: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const revokePermissions = async (req: Request, res: Response) => {
    try {
        const { memoryId, userId, permissionsToRevoke } = req.body;

        if (!memoryId || !userId || !permissionsToRevoke || !Array.isArray(permissionsToRevoke) || permissionsToRevoke.length === 0) {
            Logger.error('Faltan datos necesarios para revocar permisos');
            throw new Error('Faltan datos necesarios para revocar permisos');
        }

        const result = await permissionService.revokePermissions(
            memoryId,
            userId,
            permissionsToRevoke as PermissionType[]
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        Logger.error(`Error al revocar permisos: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserPermissions = async (req: Request, res: Response) => {
    try {
        const { userId, memoryId } = req.params;

        const permissions = await permissionService.getUserPermissions(userId, memoryId);

        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error: any) {
        Logger.error(`Error al obtener permisos del usuario: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const searchUsersByEmail = async (req: Request, res: Response) => {
    try {
        // Extraemos email, page y pageSize de los query params
        const { email, page = 1, pageSize = 10 } = req.query;

        // Parseamos page y pageSize a número, con fallback a 1 y 10 respectivamente
        const pageNum = parseInt(page as string, 10) || 1;
        const pageSizeNum = parseInt(pageSize as string, 10) || 10;

        // Llamamos al servicio pasándole email, page y pageSize
        const result = await permissionService.searchUsersByEmail({
            email: email as string,
            page: pageNum,
            pageSize: pageSizeNum,
        });

        // Devolvemos la misma estructura que en LearningOutcomeService.search
        res.status(200).json(result);
    } catch (error: any) {
        Logger.error(`Error al buscar usuarios por email: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const getPermissionByMemoriesIds = async (req: Request, res: Response) => {
    try {
        const memoryIds = req.body;

        if (!memoryIds || !Array.isArray(memoryIds)) {
            Logger.error('Faltan datos necesarios para obtener permisos por IDs de memoria');
            throw new Error('Faltan datos necesarios para obtener permisos por IDs de memoria');
        }

        const permissions = await permissionService.getPermissionByMemoriesIds(memoryIds, (req as any).user._id.toString());
        res.status(200).json({
            success: true,
            data: permissions
        });
    }
    catch (error: any) {
        Logger.error(`Error al obtener permisos por IDs de memoria: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getPermissionByUserId = async (req: Request, res: Response) => {
    try {

        const permissions = await permissionService.getPermissionByUserId((req as any).user._id.toString());
        res.status(200).json({
            success: true,
            data: permissions
        });
    } catch (error: any) {
        Logger.error(`Error al obtener permisos por ID de usuario: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
