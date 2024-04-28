import config from '../config';

const { GoogleGenerativeAI } = require('@google/generative-ai');

class VertexAI {
  private model: unknown;
  constructor() {
    const genAI = new GoogleGenerativeAI(config.get('google.key'));
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  //TODO: make async/streaming
  public async generate(prompt: string): Promise<string> {
    const result = await (this.model as any).generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  }
}

export const vertexAI = new VertexAI();
