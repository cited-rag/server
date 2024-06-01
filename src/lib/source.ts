import { Collection } from 'chromadb';
import { removeDocs } from '../db/chroma/queries/delete';
import { create as mongoCreate } from '../db/mongo/queries/create';
import { deleteOne } from '../db/mongo/queries/delete';
import { find, findById } from '../db/mongo/queries/find';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { Source as MSource, SourceModel, SourceStatus } from '../model/source';
import { ServerError } from '../utils/error';
import { chatFactory } from './chat';
import { Origin } from './origin/types';

class SourceFactory {
  public async create(source: MSource, origin: Origin): Promise<MSource> {
    source.status = SourceStatus.LOADING;
    const vector = await chatFactory.getVector(source.chat);
    const savedSource = await this.createSource(source);
    void origin.add(savedSource.id, savedSource.target, vector);
    return savedSource;
  }

  async createSource(source: MSource): Promise<MSource> {
    const createdSource = await mongoCreate(SourceModel, source as EnforcedDoc<MSource>);
    if (createdSource === null) {
      throw new ServerError({
        status: 400,
        message: 'Error creating Source',
        description: `Source could not be created`,
      });
    }
    return createdSource;
  }

  async delete(id: string): Promise<boolean> {
    const source = await findById(SourceModel, id);
    if (source === null) {
      throw new ServerError({
        status: 400,
        message: 'Source not found',
        description: `Source ${id} not found`,
      });
    }
    await removeDocs(id, (await chatFactory.getVector(source.chat)) as Collection);
    const deleteStats = await deleteOne(SourceModel, { _id: source });
    return deleteStats.deletedCount >= 1;
  }

  async getById(id: string): Promise<MSource> {
    const source = await findById(SourceModel, id);
    if (source === null) {
      throw new ServerError({
        status: 400,
        message: 'Source not found',
        description: `Source ${id} not found`,
      });
    }
    return source;
  }

  async verifyOwner(id: string, userId: string): Promise<Boolean> {
    const source = await find(SourceModel, { _id: id, owner: userId });
    if (source === null) {
      return false;
    }
    return true;
  }
}

export const sourceFactory = new SourceFactory();
