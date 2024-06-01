import pdf from 'pdf-parse';
import { ChromaLoader } from '../../db/chroma/queries/types';
import { DataType } from '../../model/source';
import { Data } from './types';

export class PDF implements Data {
  public buffer: Buffer;
  public constructor(buffer: ArrayBuffer) {
    this.buffer = buffer as Buffer;
  }

  getType(): DataType {
    return DataType.PDF;
  }
  private async getContents(): Promise<string> {
    const pdfData = await pdf(this.buffer);
    return pdfData.text;
  }

  private async getSplitContents(): Promise<string[]> {
    const pdfData = await this.getContents();
    return pdfData.split('\n\n');
  }

  async getChromaLoaders(sourceId: string): Promise<ChromaLoader[]> {
    const pdfData = await this.getSplitContents();
    return pdfData.map((c, i) => {
      return {
        id: `${sourceId}:${i}`,
        document: c,
        metadata: { source: sourceId, pageNumber: i.toString() },
      };
    });
  }
}
