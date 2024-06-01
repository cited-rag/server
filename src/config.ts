import convict from 'convict';
import convictFormatWithValidator from 'convict-format-with-validator';
import path from 'path';

convict.addFormats(convictFormatWithValidator);

export const isTestEnv = () => process.env.NODE_ENV === 'test';

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test', 'staging'],
    default: 'development',
    env: 'NODE_ENV',
  },
  mongo: {
    url: {
      format: String,
      default: 'mongodb://localhost:27018/?readPreference=primary&directConnection=true&ssl=false',
      env: 'MONGO_URL',
      arg: 'mongo_url',
    },
    db: {
      format: String,
      default: 'cited',
      env: 'MONGO_DB',
      arg: 'mongo_db',
    },
  },
  chroma: {
    url: {
      format: String,
      default: 'http://localhost:8000',
      env: 'CHROMA_URL',
      arg: 'chroma_url',
    },
  },
  api: {
    port: {
      doc: 'The port to bind.',
      format: 'port',
      default: 8080,
      env: 'PORT',
      arg: 'port',
    },
    host: {
      format: 'ipaddress',
      doc: 'The host for the server',
      default: '0.0.0.0',
      env: 'HOST',
      arg: 'host',
    },
    keep_alive: {
      format: Number,
      doc: 'Keep alive timeout for the server',
      default: 60000,
      env: 'KEEP_ALIVE',
      arg: 'keep_alive',
    },
  },
  jwt: {
    ttl: {
      format: Number,
      doc: 'The life of a jwt token',
      default: 60 * 60 * 24 * 30,
      env: 'JWT_TTL',
      arg: 'jwt_ttl',
    },
    secret: {
      format: String,
      doc: 'The secret for jwt',
      default: 'secret',
      env: 'JWT_SECRET',
      arg: 'jwt_secret',
    },
  },
  password: {
    iterations: {
      format: Number,
      doc: 'Number of salt iterations',
      default: 1000,
      env: 'PASS_ITER',
      arg: 'password_iterations',
    },
  },
  source: {
    url: {
      timeout: {
        format: Number,
        doc: 'Timeout for checking url sources',
        default: 5000,
        env: 'SOURCE_URL_TIMEOUT',
        arg: 'source_url_timeout',
      },
    },
  },
  google: {
    key: {
      format: String,
      doc: 'Key for google API products',
      default: '',
      env: 'GOOGLE_KEY',
      arg: 'google_key',
    },
  },
  frontend_url: {
    format: String,
    doc: 'URL for the frontend',
    default: 'http://localhost:3000',
    env: 'FRONTEND_URL',
    arg: 'frontend_url',
  },
});

// Load environment dependent configuration
const env = config.get('env');
const configPath = path.join(process.cwd(), 'config');
config.loadFile(`${configPath}/${env}.json`);

// Perform validation
config.validate({ allowed: 'strict' });

export default config;
