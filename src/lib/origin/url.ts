import { Collection } from 'chromadb';

import config from '../../config';
import { addDocs } from '../../db/chroma/queries/add';
import { MongoQuery } from '../../db/mongo/queries/types';
import { updateOne } from '../../db/mongo/queries/update';
import { Source as MSource, SourceModel, SourceStatus } from '../../model/source';
import { ServerError } from '../../utils/error';
import logger from '../../utils/logger';
import { PDF } from '../data/pdf';
import { Data } from '../data/types';
import { Origin } from './types';

export class Url implements Origin {
  public data: Data | null = null;
  public constructor() {}

  async add(sourceId: string, target: string, collection: Collection): Promise<MSource> {
    const data = (await this.getContents(target)) as Data | null;
    if (data === null) {
      throw new ServerError({
        status: 400,
        message: 'Invalid Url',
        description: `Url is empty or has invalid content`,
      });
    }
    this.data = data;

    const query: MongoQuery = { status: SourceStatus.LOADED };
    try {
      await addDocs(await this.data.getChromaLoaders(sourceId), collection);
    } catch (err) {
      query.status = SourceStatus.FAILED;
      logger.error(err);
    }
    query['type'] = this.data.getType();
    return updateOne(SourceModel, { _id: sourceId }, query) as Promise<MSource>;
  }

  private async getContents(url: string): Promise<Data | null> {
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
    const data = await this.parseUrlContents(contentType, response);
    return data;
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

  private async parseUrlContents(contentType: string, response: Response): Promise<Data | null> {
    switch (contentType) {
      case 'text/plain':
        return null;
      case 'application/pdf':
        return new PDF(await response.arrayBuffer());
      default:
        return null;
    }
  }
}
