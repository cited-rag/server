import { Chat } from '../model/chat';
import { LLMSource } from '../model/conversation';

export type JWTPayload = {
  exp: number;
  sub: string;
};

export type QueryProps = {
  id: string;
  query: string;
};

export type PromptContext = {
  data: string;
  id: string;
};

export type QueryRes = {
  response: string;
  sources: LLMSource[];
};

export type LLMRes = {
  response: string;
  sources: string[];
};

export type ConversationCreateProps = {
  query: string;
  response: QueryRes;
  chat: Chat;
};
