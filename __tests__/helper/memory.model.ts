import mongoose, { Document, Schema, model } from 'mongoose';

export interface IMemory extends Document {
    title: string;
    content: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    { timestamps: true }
);

export const MemoryModel = model<IMemory>('MemoryTest', MemorySchema);