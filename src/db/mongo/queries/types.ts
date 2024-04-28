import type { DeleteResult, UpdateResult } from 'mongodb';
import { FilterQuery, HydratedDocument, Model, QueryWithHelpers } from 'mongoose';

export type MongoModel<T> = Model<T>;
export type EnforcedDoc<T> = HydratedDocument<T, {}, Record<string, unknown>>;
export type MongoQuery = FilterQuery<unknown>;
export type MongoSingleResult<T> = Promise<EnforcedDoc<T> | null>;
export type MongoListResult<T> = Promise<(EnforcedDoc<T> | null)[]>;
export type MongoDeleteResult<T> = Promise<
  QueryWithHelpers<DeleteResult, EnforcedDoc<T>, Record<string, unknown>, T>
>;
export type MongoUpdateResult<T> = Promise<
  QueryWithHelpers<UpdateResult, EnforcedDoc<T>, Record<string, unknown>, T>
>;
