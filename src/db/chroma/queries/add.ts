import { AddParams, Collection, DefaultEmbeddingFunction } from 'chromadb';
import _ from 'lodash';
import { ChromaLoader } from './types';

export async function generateCreateParams(loader: ChromaLoader[]): Promise<AddParams> {
  let res: AddParams = {
    ids: [],
    documents: [],
    metadatas: [],
  };
  res = loader.reduce((acc, v): AddParams => {
    (acc.ids as string[]).push(v.id);
    (acc.documents as string[]).push(v.document);
    (acc.metadatas as unknown as Record<string, string>[]).push(v.metadata);
    return res;
  }, res);
  return res;
}

export async function addDocs(contents: ChromaLoader[], collection: Collection) {
  const embedder = new DefaultEmbeddingFunction();
  const chunks = _.chunk(contents, 100);
  for (const chunk of chunks) {
    const params = await generateCreateParams(chunk);
    params.embeddings = await embedder.generate(params.documents as string[]);
    collection.add(params);
  }
}
