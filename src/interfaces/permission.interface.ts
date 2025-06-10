import mongoose from "mongoose";

export enum PermissionType {
    EDIT = 'Edición',
    DELETE = 'Eliminar',
    OWNER = 'Propietario',
    SUBJECTS = 'Asignaturas'
}

export interface IPermission {
    userId: mongoose.Types.ObjectId;
    assignedBy: mongoose.Types.ObjectId;
    memoryId: mongoose.Types.ObjectId;
    permissions: PermissionType[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IPermissionDocument extends IPermission, mongoose.Document { }