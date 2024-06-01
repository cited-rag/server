import { QueryResponse } from 'chromadb';
import _ from 'lodash';
import { find } from '../../db/mongo/queries/find';
import { ConversationModel } from '../../model/conversation';
import { ServerError } from '../../utils/error';
import { Prompt, PromptContext } from './types';

export class QueryPrompt implements Prompt {
  private query: string;
  private prompt: string;
  private chatId: string;
  private context: PromptContext[];
  constructor(chatId: string, query: string, context: QueryResponse) {
    this.chatId = chatId;
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

      Chat history is given under the key "History" to provide context of older conversations \n
      It is in the format {query: string, response: string} \n
      where query is the question and response is the answer \n

      Reply in the json format {"response":"response to the question",sources:["source1","source2"]}
      Here "source1" and "source2" are the ids of the sources that contain the answer \n`;
  }

  private addGuardRails(): void {
    this.prompt = `${[this.prompt]}\n
    If the context does not contain the answer\n 
    OR \n
    If the question is not relevant to the context\n
    Answer with "Sorry, I don't have an answer for that question" and give the reason why"`;
  }

  private addQuery(): void {
    this.prompt = `${[this.prompt]}\n
    Question: ${this.query}\n`;
  }

  private addContext(): void {
    this.prompt = `${[this.prompt]}\n
    Context: ${JSON.stringify(this.context)}\n`;
  }

  private async addHistory(): Promise<void> {
    const conversations = await find(
      ConversationModel,
      { chat: this.chatId },
      { sort: { createdAt: -1 }, select: 'query response' },
    );
    this.prompt = `${[this.prompt]}\n
    History: ${JSON.stringify(
      conversations?.map(c => {
        return { query: c.query, response: c.response };
      }),
    )}\n`;
  }

  private validate() {
    if (this.query === '') {
      throw new ServerError({
        status: 400,
        message: 'Empty query',
        description: `No query was sent in the request`,
      });
    }
    if (this.context === undefined) {
      throw new ServerError({
        status: 400,
        message: 'Empty context',
        description: `No context was found in the request`,
      });
    }
  }

  public async generate(): Promise<string> {
    this.validate();
    this.addInstructions();
    this.addGuardRails();
    this.addQuery();
    this.addContext();
    await this.addHistory();
    return this.prompt;
  }
}
