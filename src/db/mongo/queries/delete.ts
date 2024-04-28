import { FilterQuery, QueryOptions } from 'mongoose';
import { MongoDeleteResult, MongoModel } from './types';

export async function deleteOne<T>(
  model: MongoModel<T>,
  query?: FilterQuery<T>,
  options?: QueryOptions,
): MongoDeleteResult<T> {
  return model.deleteOne(query, options as any);
}

export async function deleteMany<T>(
  model: MongoModel<T>,
  query?: FilterQuery<T>,
  options?: QueryOptions,
): MongoDeleteResult<T> {
  return model.deleteMany(query, options as any);
}
