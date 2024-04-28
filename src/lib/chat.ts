import { Collection } from 'chromadb';
import { createCollection } from '../db/chroma/queries/create';
import { removeCollection } from '../db/chroma/queries/delete';
import { findCollection } from '../db/chroma/queries/find';
import { queryCollection } from '../db/chroma/queries/query';
import { create as mongoCreate } from '../db/mongo/queries/create';
import { deleteMany, deleteOne } from '../db/mongo/queries/delete';
import { find, findById, findOne } from '../db/mongo/queries/find';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { updateOne } from '../db/mongo/queries/update';
import { Chat, ChatModel } from '../model/chat';
import { ConversationModel } from '../model/conversation';
import { Source, SourceModel } from '../model/source';
import { User } from '../model/user';
import { ConversationFactory } from './conversations';
import { LLM } from './llm';
import { Prompt } from './prompt';
import { QueryProps, QueryRes } from './types';

export class ChatFactory {
  public static async create(user: User): Promise<Chat> {
    const createdChat = await mongoCreate(ChatModel, {
      name: 'New Chat',
      owner: user.id,
    } as EnforcedDoc<Chat>);
    if (createdChat === null) {
      throw `500: Error creating Chat`;
    }
    const collection = await createCollection(createdChat.id);
    if (collection === undefined) {
      await this.delete(createdChat.id);
      throw `500: Error creating Chroma collection`;
    }
    return createdChat;
  }

  static async delete(id: string): Promise<boolean> {
    await removeCollection(id);
    await deleteMany(SourceModel, { chat: id });
    await deleteMany(ConversationModel, { chat: id });
    const deleteStats = await deleteOne(ChatModel, { _id: id });
    return deleteStats.deletedCount > 1;
  }

  static async getById(id: string): Promise<Chat> {
    return findById<Chat>(ChatModel, id) as Promise<Chat>;
  }

  static async verifyOwner(id: string, owner: string): Promise<Boolean> {
    const chat = await findOne(ChatModel, { _id: id, owner });
    if (chat === null) {
      return false;
    }
    return true;
  }

  static async getVector(id: string): Promise<Collection | undefined> {
    return findCollection(id);
  }

  static async getSources(id: string): Promise<Source[]> {
    const res = await find<Source>(SourceModel, { chat: id });
    return res === null ? [] : res;
  }

  static async updateName(query: string): Promise<Chat> {
    return updateOne(ChatModel, { query }, { name: query }) as Promise<Chat>;
  }

  static async query(queryProps: QueryProps): Promise<QueryRes> {
    const chat = await ChatFactory.getById(queryProps.id);
    const collection = (await findCollection(queryProps.id)) as Collection;
    if (collection === undefined) {
      throw `400: Collection not found`;
    }
    const ragSources = await queryCollection(queryProps.query, collection);

    const promptBuilder = new Prompt(queryProps.id, queryProps.query, ragSources);
    const llm = new LLM(promptBuilder);
    const llmResponse = await llm.generate();
    void ConversationFactory.create({
      chat: chat,
      query: queryProps.query,
      response: llmResponse,
    });
    void ChatFactory.updateName(queryProps.query);
    return llmResponse;
  }
}
