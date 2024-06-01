import Joi from 'joi';
import { ServerError } from '../utils/error';
import logger from '../utils/logger';
import { vertexAI } from '../utils/vertex';
import { Prompt } from './prompt';
import { LLMRes, QueryRes } from './types';

export class LLM {
  private prompt: Prompt;
  constructor(prompt: Prompt) {
    this.prompt = prompt;
  }

  public async generate(): Promise<QueryRes> {
    const prompt = await this.prompt.generate();
    const response = await vertexAI.generate(prompt);
    const responseJSON = this.buildJsonResponse(response);
    const sources = responseJSON.sources;
    return { response: responseJSON.response, sources };
  }

  private buildJsonResponse(response: string): LLMRes {
    const validationSchema = Joi.object({
      response: Joi.string().required(),
      sources: Joi.array().items(Joi.string()).required(),
    });
    try {
      const jsonResponse = JSON.parse(response) as LLMRes;
      Joi.assert(jsonResponse, validationSchema);
      return jsonResponse;
    } catch (err) {
      logger.info(response);
      throw new ServerError({
        status: 400,
        message: 'Invalid LLM response',
        description: `LLM response is not valid: ${err}`,
      });
    }
  }
}
