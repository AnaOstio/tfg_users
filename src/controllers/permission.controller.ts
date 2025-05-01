import { Request, Response } from 'express';
import * as PermissionService from '../services/permission.service';
import { PermissionType, ResourceType } from '../models/permission.model';

export const searchUserByEmail = async (req: Request, res: Response) => {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
        return res.status(400).json({ error: 'Email inválido' });
    }

    const user = await PermissionService.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ user: { id: user._id, email: user.email } });
};

export const getPermissions = (_req: Request, res: Response) => {
    res.json({ permissions: PermissionService.getAvailablePermissions() });
};

export const assign = async (req: Request, res: Response) => {
    const { userId, resourceId, permissions } = req.body;
    const grantedBy = (req as any).user._id;

    if (!userId || !resourceId || !Array.isArray(permissions) || permissions.length === 0) {
        return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    try {
        const result = await PermissionService.assignPermissions({
            userId,
            resourceId,
            resourceType: ResourceType.THESIS,
            permissions,
            grantedBy
        });

        return res.json({
            message: 'Permisos asignados correctamente',
            data: result
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};

export const revoke = async (req: Request, res: Response) => {
    const { userId, resourceId } = req.body;

    if (!userId || !resourceId) {
        return res.status(400).json({ error: 'Datos de entrada inválidos' });
    }

    try {
        await PermissionService.revokePermissions({
            userId,
            resourceId,
            resourceType: ResourceType.THESIS
        });

        return res.json({ message: 'Permisos revocados correctamente' });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
};
