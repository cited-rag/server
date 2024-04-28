import { ObjectId } from 'mongodb';
import { FilterQuery, QueryOptions } from 'mongoose';
import logger from '../../../utils/logger';
import { EnforcedDoc, MongoModel, MongoQuery } from './types';

export async function findById<T>(
  model: MongoModel<T>,
  id: string,
  options?: QueryOptions,
): Promise<T | null> {
  let doc: EnforcedDoc<T> | null = null;
  try {
    doc = await model.findById(id, null, options);
  } catch (e: any) {
    logger.error(`findById error:${e.message}`);
    return null;
  }
  return doc;
}

export async function findByIds<T>(
  model: MongoModel<T>,
  ids: readonly string[],
  options?: QueryOptions,
): Promise<(T | null)[]> {
  const query: MongoQuery = { _id: { $in: ids.filter(id => ObjectId.isValid(id)) } };
  let docs: (EnforcedDoc<T> | null)[] = [];
  docs = await model.find(query, null, options);
  const filteredDocs = docs.filter(d => d) as EnforcedDoc<T>[];
  return filteredDocs;
}

export async function find<T>(
  model: MongoModel<T>,
  query?: FilterQuery<T>,
  options?: QueryOptions,
): Promise<T[] | null> {
  return model.find(query ?? {}, null, options) as unknown as T[] | null;
}

export async function findOne<T>(
  model: MongoModel<T>,
  query: FilterQuery<T>,
  options?: QueryOptions,
): Promise<T | null> {
  return model.findOne(query, null, options);
}

export async function count<T>(model: MongoModel<T>, query?: FilterQuery<T>): Promise<number> {
  return model.countDocuments(query ?? {});
}
