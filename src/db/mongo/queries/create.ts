import { EnforcedDoc, MongoModel } from './types';

export async function create<T>(model: MongoModel<T>, doc: EnforcedDoc<T>): Promise<T | null> {
  return model.create(doc);
}
