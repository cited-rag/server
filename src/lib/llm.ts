import { parse as bestJsonParse } from 'best-effort-json-parser';
import { io } from '../socket';
import { vertexAI } from '../utils/vertex';
import { Prompt } from './prompt';

export class LLM {
  private prompt: Prompt;
  private room: string;
  constructor(prompt: Prompt, room: string) {
    this.prompt = prompt;
    this.room = room;
  }

  public async generate(): Promise<string> {
    const prompt = await this.prompt.generate();
    const stream = await vertexAI.generate(prompt);
    let response: string = '';
    let responseJson: Record<string, unknown> = {};
    for await (const chunk of stream) {
      response += chunk;
      responseJson = bestJsonParse(response);
      io.to(this.room).emit('response', responseJson);
    }
    return response;
  }
}
