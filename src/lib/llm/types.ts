import Stream from 'stream';

export interface LLM {
  generate(): Promise<Stream.Readable>;
}
