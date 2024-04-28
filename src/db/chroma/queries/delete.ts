import { Collection } from 'chromadb';
import { Chroma } from '..';

export async function removeDocs(id: string, collection: Collection): Promise<string[]> {
  return collection.delete({ where: { parent: id } });
}

export async function removeCollection(name: string): Promise<void> {
  return Chroma?.deleteCollection({ name });
}
