import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export type Chat = {
  id: string;
  name: string;
  owner: string;
};

const ChatSchema = new Schema(
  {
    name: String,
    owner: String,
  },
  getMongoSchemaOptions(true, true),
);

export const ChatModel = model<Chat>('chat', ChatSchema, 'chat');
