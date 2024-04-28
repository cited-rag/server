import Joi from 'joi';
import _ from 'lodash';
import { LLMSource } from '../model/conversation';
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
    const sources = await this.buildLLMSources(responseJSON.sources);
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
      throw `400: Invalid LLM response`;
    }
  }

  private async buildLLMSources(sources: string[]): Promise<LLMSource[]> {
    return sources.reduce((acc, v) => {
      const sourceParts = v.split(':');
      if (sourceParts.length !== 2) {
        throw `400: Invalid source format`;
      }
      const source = _.find(acc, s => {
        s.source === sourceParts[0];
      }) as LLMSource | undefined;
      if (!source) {
        acc.push({ source: sourceParts[0], pages: [sourceParts[1]] });
      } else {
        source.pages.push(sourceParts[1]);
      }
      return acc;
    }, [] as LLMSource[]);
  }
}
