import { AddParams, Collection, DefaultEmbeddingFunction } from 'chromadb';
import _ from 'lodash';
import { CreateLoader } from './types';

export function generateCreateLoader(id: string, contents: string[]): CreateLoader[] {
  return contents.map((c, i) => {
    return { id: `${id}:${i}`, document: c };
  });
}

export async function generateCreateParams(id: string, loader: CreateLoader[]): Promise<AddParams> {
  let res: AddParams = {
    ids: [],
    documents: [],
    metadatas: [],
  };
  res = loader.reduce((acc, v): AddParams => {
    (acc.ids as string[]).push(v.id);
    (acc.documents as string[]).push(v.document);
    (acc.metadatas as unknown as Record<string, string>[]).push({ parent: id });
    return res;
  }, res);
  return res;
}

export async function addDocs(id: string, contents: string[], collection: Collection) {
  const embedder = new DefaultEmbeddingFunction();
  const loader = generateCreateLoader(id, contents);
  const chunks = _.chunk(loader, 100);
  for (const chunk of chunks) {
    const params = await generateCreateParams(id, chunk);
    params.embeddings = await embedder.generate(params.documents as string[]);
    collection.add(params);
  }
}
