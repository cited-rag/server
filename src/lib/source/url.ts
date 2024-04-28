import { Collection } from 'chromadb';
import pdf from 'pdf-parse';
import { ISource } from '.';
import config from '../../config';
import { addDocs } from '../../db/chroma/queries/add';
import { update } from '../../db/mongo/queries/update';
import { Source as MSource, SourceModel, SourceStatus } from '../../model/source';
import logger from '../../utils/logger';

export class Url implements ISource {
  public source: MSource;
  public constructor(source: MSource) {
    this.source = source;
  }

  async add(source: MSource, collection: Collection): Promise<MSource> {
    const contents = await this.getContents(source.target);
    if (contents.length === 0) {
      throw `400: Url is empty or has invalid content`;
    }
    try {
      await addDocs(source.id, contents, collection);
      this.source = source;
    } catch (err) {
      update(SourceModel, { _id: source.id }, { status: SourceStatus.FAILED });
      logger.error(err);
    }
    //TODO: add websocket message with update
    update(SourceModel, { _id: source.id }, { status: SourceStatus.LOADED });

    return source;
  }

  private async getContents(url: string): Promise<string[]> {
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
      throw `400: Invalid url destination`;
    }
    const contentType = this.getContentType(response.headers);
    const contents = await this.parseUrlContents(contentType, response);
    return contents.split('\n\n');
  }

  private getContentType(header: Headers): string {
    const contentType = header.get('content-type');
    if (contentType === null) {
      throw `400: No content type for URL`;
    }
    return contentType.split(';')[0];
  }

  private async parseUrlContents(contentType: string, response: Response): Promise<string> {
    switch (contentType) {
      case 'text/plain':
        return response.text();
      case 'application/pdf':
        const pdfData = await pdf((await response.arrayBuffer()) as Buffer);
        return pdfData.text;
      default:
        return '';
    }
  }
}
