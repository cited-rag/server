import { Collection } from 'chromadb';

import config from '../../config';
import { addDocs } from '../../db/chroma/queries/add';
import { MongoQuery } from '../../db/mongo/queries/types';
import { updateOne } from '../../db/mongo/queries/update';
import { DataType, Source as MSource, SourceModel, SourceStatus } from '../../model/source';
import { SocketEvents, emitEvent } from '../../socket';
import { ServerError } from '../../utils/error';
import logger from '../../utils/logger';
import { PDF } from '../data/pdf';
import { Data } from '../data/types';
import { Origin } from './types';

export class Url implements Origin {
  public data: Data | null = null;
  public constructor() {}

  async add(sourceId: string, target: string, collection: Collection): Promise<MSource> {
    const { data, type } = await this.getContents(target);
    if (data === null) {
      throw new ServerError({
        status: 400,
        message: 'Invalid Url',
        description: `Url is empty or has invalid content`,
      });
    }
    this.data = data;

    const query: MongoQuery = { status: SourceStatus.LOADED, dataType: type };
    try {
      await addDocs(await this.data.getChromaLoaders(sourceId), collection);
    } catch (err) {
      query.status = SourceStatus.FAILED;
      logger.error(err);
    }
    query['type'] = this.data.getType();
    const updatedSource = (await updateOne(SourceModel, { _id: sourceId }, query)) as MSource;
    emitEvent(updatedSource.owner, SocketEvents.UPDATE, {
      collection: SourceModel.collection.name,
      id: updatedSource.id.toString(),
      update: query,
    });
    return updatedSource;
  }

  private async getContents(url: string): Promise<{ data: Data | null; type: DataType }> {
    const response = (await Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('400: Timeout fetching url')),
          config.get('source.url.timeout'),
        ),
      ),
    ])) as Response;
    if (response.status != 200) {
      throw new ServerError({
        status: 400,
        message: 'Invalid Url',
        description: `Invalid url destination`,
      });
    }
    const contentType = this.getContentType(response.headers);
    return this.parseUrlContents(contentType, response);
  }

  private getContentType(header: Headers): string {
    const contentType = header.get('content-type');
    if (contentType === null) {
      throw new ServerError({
        status: 400,
        message: 'Invalid Url',
        description: `No content type for URL`,
      });
    }
    return contentType.split(';')[0];
  }

  private async parseUrlContents(
    contentType: string,
    response: Response,
  ): Promise<{ data: Data | null; type: DataType }> {
    switch (contentType) {
      case 'text/plain':
        return { data: null, type: DataType.TEXT };
      case 'application/pdf':
        return { data: new PDF(await response.arrayBuffer()), type: DataType.PDF };
      default:
        return { data: null, type: DataType.NONE };
    }
  }
}
