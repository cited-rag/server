import http from 'http';
import { Server } from 'socket.io';
import config from '../config';
import { verifyJWTSocket } from '../middleware/auth';
import { ServerError } from '../utils/error';
import logger from '../utils/logger';
import { SocketEvents, SocketMessage } from './types';

export let io: Server = {} as Server;

export function registerSocketServer(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: config.get('frontend_url'),
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

export function emitEvent(room: string, event: SocketEvents, data: SocketMessage) {
  io.to(room).emit(event, data);
}
