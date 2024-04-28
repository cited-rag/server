import mongoose from 'mongoose';
import config, { isTestEnv } from '../../config';
import logger from '../../utils/logger';

export async function connect() {
  try {
    if (!isTestEnv()) {
      logger.info('Connecting to DB...', config.get('mongo.url'));
    }
    await mongoose.connect(config.get('mongo.url'), {
      dbName: config.get('mongo.db'),
      readPreference: 'secondary',
    });
    if (!isTestEnv()) {
      logger.info('Connected to MongoDB!');
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}

export const disconnect = (): Promise<void> => mongoose.disconnect();
