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
    chat: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
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
