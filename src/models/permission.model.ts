import { Schema, model, Document, Types } from 'mongoose';

export enum PermissionType {
    EDITAR = 'EDITAR',
    ELIMINAR = 'ELIMINAR'
}

export enum ResourceType {
    THESIS = 'THESIS'
}

export interface IPermission extends Document {
    userId: Types.ObjectId;
    resourceId: string;
    resourceType: ResourceType;
    permissions: PermissionType[];
    grantedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resourceId: { type: String, required: true },
    resourceType: { type: String, enum: Object.values(ResourceType), default: ResourceType.THESIS },
    permissions: [{ type: String, enum: Object.values(PermissionType), required: true }],
    grantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

PermissionSchema.pre<IPermission>('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export default model<IPermission>('Permission', PermissionSchema);