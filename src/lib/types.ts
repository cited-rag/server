import { Chat } from '../model/chat';
import { PDFMetadata } from './data/types';

export type JWTPayload = {
  exp: number;
  sub: string;
};

export type QueryProps = {
  id: string;
  query: string;
};

export type QueryRes = {
  response: string | null;
  sources: string[] | null;
};

export type ConversationCreateProps = {
  query: string;
  response: QueryRes;
  chat: Chat;
};

export type SourceMetadata = PDFMetadata;
export type SourceMetadataResponse = Record<string, SourceMetadata>;
