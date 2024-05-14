export enum SocketEvents {
  RESPONSE = 'response',
  UPDATE = 'update',
  EXCEPTION = 'exception',
}

export type UpdateMessage = {
  collection: string;
  id: string;
  update: any;
};

export type ResponseMessage = {
  response: Record<string, unknown>;
  chat: string;
};

export type ExceptionMessage = {
  action: string;
  message: string;
};

export type SocketMessage = UpdateMessage | ResponseMessage | ExceptionMessage;

export enum SocketExceptionAction {
  ADD_URL = 'add_url',
  QUERY = 'query',
}
