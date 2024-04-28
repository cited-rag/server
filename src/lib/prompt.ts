import { QueryResponse } from 'chromadb';
import _ from 'lodash';
import { PromptContext } from './types';

export class Prompt {
  private query: string;
  private prompt: string;
  private context: PromptContext[];
  constructor(query: string, context: QueryResponse) {
    this.query = query;
    this.context = this.buildContext(context);
    this.prompt = '';
  }

  private buildContext(response: QueryResponse): PromptContext[] {
    let { ids, documents } = response;
    const flatIds = _.flattenDeep(ids);
    const flatDocuments = _.flattenDeep(documents);
    return flatIds.map((id, index) => {
      return {
        data: flatDocuments[index],
        id,
      } as PromptContext;
    });
  }

  private addInstructions(): void {
    this.prompt = `${[this.prompt]}\n
      Instructions: \n
      Answer the question with the context given below, \n

      The context is a json object with the following properties \n
      {data: string, id: string} \n
      where data is the context and id is the id of the collection \n

      Reply in the json format {"response":"response to the question",sources:["source1","source2"]}
      Here "source1" and "source2" are the ids of the sources that contain the answer \n`;
  }

  private addGuardRails(): void {
    this.prompt = `${[this.prompt]}\n
    If the context does not contain the answer, answer "I don't know" \n 
    If the question is not relevant to the context, answer "I don't know"`;
  }

  private addQuery(): void {
    this.prompt = `${[this.prompt]}\n
    Question: ${this.query}\n`;
  }

  private addContext(): void {
    this.prompt = `${[this.prompt]}\n
    Context: ${JSON.stringify(this.context)}\n`;
  }

  private validate() {
    if (this.query === '') {
      throw '400: Empty query';
    }
    if (this.context === undefined) {
      throw '400: Empty context';
    }
  }

  public generate(): string {
    this.validate();
    this.addInstructions();
    this.addGuardRails();
    this.addQuery();
    this.addContext();
    return this.prompt;
  }
}
