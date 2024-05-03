import { Schema, model } from 'mongoose';
import { getMongoSchemaOptions } from './common';

export type LLMSource = {
  source: string;
  pages: string[];
};

export type Conversation = {
  id: string;
  sources: LLMSource[];
  chat: string;
  owner: string;
  query: string;
  response: string;
};

const LLMSourceSchema = new Schema(
  {
    source: Schema.Types.ObjectId,
    pages: [String],
  },
  getMongoSchemaOptions(),
);

const ConversationSchema = new Schema(
  {
    target: String,
    chat: Schema.Types.ObjectId,
    owner: Schema.Types.ObjectId,
    query: String,
    response: String,
    sources: [LLMSourceSchema],
  },
  getMongoSchemaOptions(true, true),
);

export const ConversationModel = model<Conversation>(
  'conversation',
  ConversationSchema,
  'conversation',
);
