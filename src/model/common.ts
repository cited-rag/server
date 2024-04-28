import { FlatRecord, SchemaOptions } from "mongoose";



export function getMongoSchemaOptions<T>(
    _id = false,
    timestamps = false,
  ): SchemaOptions<FlatRecord<T>> {
    const transformer = function (_doc: unknown, ret: Record<string, unknown>) {
      delete ret._id;
    };
  
    return {
      _id,
      timestamps,
      toObject: {
        getters: true,
        virtuals: true,
        transform: transformer,
      },
      toJSON: {
        getters: true,
        virtuals: true,
        transform: transformer,
      },
    };
  }