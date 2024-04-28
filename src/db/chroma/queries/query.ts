import { Collection, QueryResponse } from 'chromadb';

export async function queryCollection(
  query: string,
  collection: Collection,
  results: number = 3,
): Promise<QueryResponse> {
  return collection.query({ queryTexts: query, nResults: results });
}
