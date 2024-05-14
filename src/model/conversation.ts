import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export type Conversation = {
  id: string;
  sources: string[];
  chat: string;
  owner: string;
  query: string;
  response: string;
};

const ConversationSchema = new Schema(
  {
    target: String,
    chat: String,
    owner: String,
    query: String,
    response: String,
    sources: [String],
  },
  getMongoSchemaOptions(true, true),
);

export const ConversationModel = model<Conversation>(
  'conversation',
  ConversationSchema,
  'conversation',
);
