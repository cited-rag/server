import { Collection } from 'chromadb';
import { removeDocs } from '../../db/chroma/queries/delete';
import { create as mongoCreate } from '../../db/mongo/queries/create';
import { deleteOne } from '../../db/mongo/queries/delete';
import { find, findById } from '../../db/mongo/queries/find';
import { EnforcedDoc } from '../../db/mongo/queries/types';
import { Source as MSource, SourceModel, SourceStatus } from '../../model/source';
import { ChatFactory } from '../chat';

export interface ISource {
  source: MSource;
  add(source: MSource, collection: Collection): Promise<MSource>;
}

export class SourceFactory {
  public static async create(source: ISource): Promise<MSource> {
    source.source.status = SourceStatus.LOADING;
    const vector = await ChatFactory.getVector(source.source.chat);
    if (vector === undefined) {
      throw `400: Chat not found`;
    }

    const savedSource = await this.createSource(source.source);
    void source.add(savedSource, vector);
    return savedSource;
  }

  static async createSource(source: MSource): Promise<MSource> {
    const createdSource = await mongoCreate(SourceModel, source as EnforcedDoc<MSource>);
    if (createdSource === null) {
      throw `500: Error creating Source`;
    }
    return createdSource;
  }

  static async delete(id: string): Promise<boolean> {
    const source = await findById(SourceModel, id);
    if (source === null) {
      throw `400: Source not found`;
    }
    await removeDocs(id, (await ChatFactory.getVector(source.chat)) as Collection);
    const deleteStats = await deleteOne(SourceModel, { _id: source });
    return deleteStats.deletedCount >= 1;
  }

  static async getById(id: string): Promise<MSource> {
    const source = await findById(SourceModel, id);
    if (source === null) {
      throw `400: Sources not found`;
    }
    return source;
  }

  static async verifyOwner(id: string, userId: string): Promise<Boolean> {
    const source = await find(SourceModel, { _id: id, owner: userId });
    if (source === null) {
      return false;
    }
    return true;
  }
}
