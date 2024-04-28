import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export type User = {
  id: string;
  password: string;
  name: string;
  salt: string;
};

const UserSchema = new Schema(
  {
    password: String,
    name: String,
    salt: String,
  },
  getMongoSchemaOptions(true, true),
);

UserSchema.index({ name: 1 }, { unique: true });
export const UserModel = model<User>('user', UserSchema, 'user');
UserModel.ensureIndexes();
