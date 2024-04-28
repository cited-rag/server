import { ChromaClient, DefaultEmbeddingFunction } from 'chromadb';
import config, { isTestEnv } from '../../config';
import logger from '../../utils/logger';

export let Chroma: ChromaClient | null = null;
export const Embedder = new DefaultEmbeddingFunction();

export async function connect() {
  try {
    Chroma = new ChromaClient({
      path: config.get('chroma.url'),
    });
    if (!isTestEnv()) {
      const heartbeat = await Chroma.heartbeat();
      logger.info(`Connected to ChromaDB! ${heartbeat}`);
    }
  } catch (error) {
    logger.error(error);
    throw error;
  }
}
