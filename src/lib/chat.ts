import { Collection } from 'chromadb';
import { createCollection } from '../db/chroma/queries/create';
import { removeCollection } from '../db/chroma/queries/delete';
import { findCollection } from '../db/chroma/queries/find';
import { queryCollection } from '../db/chroma/queries/query';
import { create as mongoCreate } from '../db/mongo/queries/create';
import { deleteMany, deleteOne } from '../db/mongo/queries/delete';
import { find, findById, findOne } from '../db/mongo/queries/find';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { Chat, ChatModel } from '../model/chat';
import { Source, SourceModel } from '../model/source';
import { User } from '../model/user';
import { vertexAI } from '../utils/vertex';
import { QueryProps } from './types';

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

  static async query(queryProps: QueryProps): Promise<string> {
    const collection = (await findCollection(queryProps.id)) as Collection;
    const ragSources = await queryCollection(queryProps.query, collection);
    const prompt = `
    Instructions: \n
    Answer the question with the context given below \n, 
    If the context does not contain the answer, answer "I don't know" \n 
    If the question is not relevant to the context, answer "I don't know"
    Question: ${queryProps.query}\n
    Context: ${ragSources.documents}
    `;
    // TODO: get back a json with the {response,sources given the ids}
    const response = await vertexAI.generate(prompt);
    return response;
  }
}
