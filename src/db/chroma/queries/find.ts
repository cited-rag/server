import { Collection, GetResponse } from 'chromadb';
import { Chroma, Embedder } from '..';

export async function findCollection(name: string): Promise<Collection | undefined> {
  return Chroma?.getCollection({ name, embeddingFunction: Embedder });
}

export async function findByIds(ids: string[], collection: Collection): Promise<GetResponse> {
  return collection.get({ ids });
}
