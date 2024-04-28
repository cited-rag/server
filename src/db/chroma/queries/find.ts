import { Collection } from 'chromadb';
import { Chroma, Embedder } from '..';

export async function findCollection(name: string): Promise<Collection | undefined> {
  return Chroma?.getCollection({ name, embeddingFunction: Embedder });
}
