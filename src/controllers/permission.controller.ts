import { Request, Response } from 'express';
import permissionService from '../services/permission.service';
import Logger from '../config/logger';
import { PermissionType } from '../interfaces/permission.interface';

export const assignPermissions = async (req: Request, res: Response) => {
    try {
        const { memoryId, userId, assignedBy, permissions } = req.body;

        if (!memoryId || !userId || !assignedBy || !permissions || !Array.isArray(permissions) || permissions.length === 0) {
            Logger.error('Faltan datos necesarios para asignar permisos');
            throw new Error('Faltan datos necesarios para asignar permisos');
        }

        const result = await permissionService.assignPermissions(
            memoryId,
            userId,
            assignedBy,
            permissions as PermissionType[]
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
        const { email } = req.query;

        const users = await permissionService.searchUsersByEmail(email as string);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error: any) {
        Logger.error(`Error al buscar usuarios por email: ${error.message}`);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
