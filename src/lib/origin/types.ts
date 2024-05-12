import { Collection } from 'chromadb';
import { Source as MSource } from '../../model/source';

export interface Origin {
  add(sourceId: string, target: string, collection: Collection): Promise<MSource>;
}
