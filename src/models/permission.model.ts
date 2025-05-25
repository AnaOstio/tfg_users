import mongoose from 'mongoose';
import { IPermissionDocument, PermissionType } from '../interfaces/permission.interface';

const permissionSchema = new mongoose.Schema<IPermissionDocument>({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memoryId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    permissions: {
        type: [String],
        enum: Object.values(PermissionType),
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Permission = mongoose.model<IPermissionDocument>('Permission', permissionSchema);
export default Permission;