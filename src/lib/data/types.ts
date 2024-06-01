import { ChromaLoader } from '../../db/chroma/queries/types';
import { DataType } from '../../model/source';

export interface Data {
  getType(): DataType;
  getChromaLoaders(sourceId: string): Promise<ChromaLoader[]>;
}

export type PDFMetadata = {
  parentId: string;
  pageNumber: number;
};
