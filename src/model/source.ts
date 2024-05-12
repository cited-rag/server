import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export enum DataType {
  NONE = 'none',
  PDF = 'pdf',
  TEXT = 'text',
}

export enum OriginType {
  NONE = 'none',
  URL = 'url',
}

export enum SourceStatus {
  LOADED = 'loaded',
  FAILED = 'failed',
  LOADING = 'loading',
}

export type Origin = {
  target: string;
  type: OriginType;
};

export type Source = {
  id: string;
  target: string;
  dataType: DataType;
  chat: string;
  owner: string;
  status: SourceStatus;
  origin: Origin[];
};

const OriginSchema = new Schema(
  {
    target: String,
    type: { type: String, enum: OriginType },
  },
  getMongoSchemaOptions(),
);

const SourceSchema = new Schema(
  {
    target: String,
    dataType: { type: String, enum: DataType },
    chat: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    status: { type: String, enum: SourceStatus },
    origin: [OriginSchema],
  },
  getMongoSchemaOptions(true, true),
);

SourceSchema.index({ target: 1, type: 1, chat: 1 }, { unique: true });
export const SourceModel = model<Source>('source', SourceSchema, 'source');
SourceModel.ensureIndexes();
