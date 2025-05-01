import { Types } from 'mongoose';
import Permission, { PermissionType, ResourceType } from '../models/permission.model';
import User from '../models/user.model';

export const findUserByEmail = async (email: string) => {
    return await User.findOne({ email: email.toLowerCase().trim() });
};

export const getAvailablePermissions = () => {
    return Object.values(PermissionType);
};

export const assignPermissions = async ({
    userId,
    resourceId,
    resourceType,
    permissions,
    grantedBy
}: {
    userId: string;
    resourceId: string;
    resourceType: ResourceType;
    permissions: PermissionType[];
    grantedBy: string;
}) => {
    const userObjectId = new Types.ObjectId(userId);
    const grantedByObjectId = new Types.ObjectId(grantedBy);

    const existing = await Permission.findOne({ userId: userObjectId, resourceId, resourceType });

    if (existing) {
        existing.permissions = permissions;
        existing.grantedBy = grantedByObjectId;
        await existing.save();
        return existing;
    }

    const newPermission = new Permission({
        userId: userObjectId,
        resourceId,
        resourceType,
        permissions,
        grantedBy: grantedByObjectId
    });

    await newPermission.save();
    return newPermission;
};

export const revokePermissions = async ({
    userId,
    resourceId,
    resourceType
}: {
    userId: string;
    resourceId: string;
    resourceType: ResourceType;
}) => {
    const deleted = await Permission.findOneAndDelete({ userId, resourceId, resourceType });
    return deleted;
};
