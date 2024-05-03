import fs from 'fs';
import { default as https, ServerOptions } from 'https';
import path from 'path';
import app from './app';
import config from './config';
import { connect as ChromaConnect } from './db/chroma';
import { connect as mongoConnect } from './db/mongo';

async function main() {
  await mongoConnect();
  await ChromaConnect();

  const serverConfig = {
    domain: config.get('api.host'),
    https: {
      port: config.get('api.port'),
      options: {
        key: fs.readFileSync(path.resolve(process.cwd(), 'certs/key.pem'), 'utf8').toString(),
        cert: fs.readFileSync(path.resolve(process.cwd(), 'certs/cert.pem'), 'utf8').toString(),
        passphrase: config.get('api.passphrase'),
      },
    },
  };

  let serverCallback = app.callback();
  try {
    const httpsServer = https.createServer(
      serverConfig.https.options as ServerOptions,
      serverCallback,
    );
    httpsServer.listen(serverConfig.https.port, () => {
      console.log(`HTTPS server OK: https://${config.get('api.host')}:${config.get('api.port')}`);
    });
  } catch (ex) {
    console.error(`Failed to start HTTPS server ${ex}`);
  }
}

main();
