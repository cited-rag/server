import http from 'http';
import app from './app';
import config from './config';
import { connect as ChromaConnect } from './db/chroma';
import { connect as mongoConnect } from './db/mongo';
import { registerSocketServer } from './socket';
import logger from './utils/logger';

async function main() {
  await mongoConnect();
  await ChromaConnect();
  const httpServer = http.createServer(app.callback());
  registerSocketServer(httpServer);

  httpServer.listen(config.get('api.port'));
  logger.info(`Started Cited Server on port:${config.get('api.port')}`);
}

main();
