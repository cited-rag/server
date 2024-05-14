import {
  GenerateContentCandidate,
  GenerateContentStreamResult,
  GenerativeModel,
} from '@google/generative-ai';
import Stream from 'stream';
import { vertexAI } from '../../utils/vertex';
import { LLM, Prompt } from '../types';

export class Vertex implements LLM {
  private prompt: Prompt;
  private model: GenerativeModel;
  constructor(prompt: Prompt) {
    this.prompt = prompt;
    this.model = vertexAI.getGenerativeModel({ model: 'gemini-pro' }, { apiVersion: 'v1beta' });
  }

  private async parseStream(
    response: GenerateContentStreamResult,
    responseStream: Stream.Readable,
  ): Promise<void> {
    for await (const item of response.stream) {
      responseStream.push(
        (item?.candidates as unknown as GenerateContentCandidate[])[0].content.parts[0].text,
      );
    }
    responseStream.push(null);
  }

  public async generate(): Promise<Stream.Readable> {
    const prompt = await this.prompt.generate();
    const responseStream = new Stream.Readable({ read: () => {} });
    const streamListener = await (this.model as any).generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    void this.parseStream(streamListener, responseStream);
    return responseStream;
  }
}
