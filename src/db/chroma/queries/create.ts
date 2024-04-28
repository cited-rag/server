import { Collection } from 'chromadb';
import { Chroma, Embedder } from '..';

export async function createCollection(name: string): Promise<Collection | undefined> {
  return Chroma?.createCollection({
    name,
    embeddingFunction: Embedder,
  });
}
