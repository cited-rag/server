import Stream from 'stream';
import config from '../config';

import {
  GenerateContentCandidate,
  GenerateContentStreamResult,
  GenerativeModel,
  GoogleGenerativeAI,
} from '@google/generative-ai';

class VertexAI {
  private model: GenerativeModel;
  constructor() {
    const genAI = new GoogleGenerativeAI(config.get('google.key'));
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' }, { apiVersion: 'v1beta' });
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

  public async generate(prompt: string): Promise<Stream.Readable> {
    const responseStream = new Stream.Readable({ read: () => {} });
    const streamListener = await (this.model as any).generateContentStream({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });
    void this.parseStream(streamListener, responseStream);
    return responseStream;
  }
}

export const vertexAI = new VertexAI();
