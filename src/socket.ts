import http from 'http';
import { Server } from 'socket.io';
import config from './config';
import { verifyJWTSocket } from './middleware/auth';
import { ServerError } from './utils/error';
import logger from './utils/logger';

export enum SocketEvents {
  RESPONSE = 'response',
  UPDATE = 'update',
  EXCEPTION = 'exception',
}

export let io: Server = {} as Server;

export function registerSocketServer(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: process.env.frontend_url,
    },
  });
  logger.info(`Socket server is listening on port:${config.get('api.port')}`);
  io.on('connection', async socket => {
    try {
      const payload = await verifyJWTSocket(socket.handshake.headers);
      socket.join(payload.sub);
    } catch (err) {
      const { description, message, status } = err as ServerError;
      socket.emit('exception', { message, status, description });
      socket.disconnect();
    }
  });
}

export function emitEvent(room: string, event: SocketEvents, data: Record<string, unknown>) {
  console.log(room, event, data);
  io.to(room).emit(event, data);
}
