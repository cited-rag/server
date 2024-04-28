import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { MongoModel, MongoSingleResult, MongoUpdateResult } from './types';

export function addVersionIncrementQuery<T>(update: UpdateQuery<T>): UpdateQuery<T> {
  (update['$inc'] as unknown) = { __v: 1, ...update['$inc'] };
  return update;
}

export async function updateOne<T>(
  model: MongoModel<T>,
  query: FilterQuery<T>,
  update: UpdateQuery<T>,
  options?: QueryOptions,
): MongoSingleResult<T> {
  update = addVersionIncrementQuery(update);
  return model.findOneAndUpdate(query, update, { new: true, ...options });
}

export async function update<T>(
  model: MongoModel<T>,
  query: FilterQuery<T>,
  update: UpdateQuery<T>,
): Promise<MongoUpdateResult<T>> {
  update = addVersionIncrementQuery(update);
  return model.updateMany(query, update);
}
