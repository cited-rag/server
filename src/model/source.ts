import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export enum SourceType {
  URL = 'url',
  FILE = 'file',
}

export enum SourceStatus {
  LOADED = 'loaded',
  FAILED = 'failed',
  LOADING = 'loading',
}

export type Source = {
  id: string;
  target: string;
  type: SourceType;
  chat: string;
  owner: string;
  status: SourceStatus;
};

const SourceSchema = new Schema(
  {
    target: String,
    type: { type: String, enum: SourceType },
    chat: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    status: { type: String, enum: SourceStatus },
  },
  getMongoSchemaOptions(true, true),
);

SourceSchema.index({ target: 1, type: 1, chat: 1 }, { unique: true });
export const SourceModel = model<Source>('source', SourceSchema, 'source');
SourceModel.ensureIndexes();
