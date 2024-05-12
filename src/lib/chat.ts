import { Collection } from 'chromadb';
import { createCollection } from '../db/chroma/queries/create';
import { removeCollection } from '../db/chroma/queries/delete';
import { findByIds, findCollection } from '../db/chroma/queries/find';
import { queryCollection } from '../db/chroma/queries/query';
import { create as mongoCreate } from '../db/mongo/queries/create';
import { deleteMany, deleteOne } from '../db/mongo/queries/delete';
import { find, findById, findOne } from '../db/mongo/queries/find';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { updateOne } from '../db/mongo/queries/update';
import { Chat, ChatModel } from '../model/chat';
import { Conversation, ConversationModel } from '../model/conversation';
import { Source, SourceModel } from '../model/source';
import { User } from '../model/user';
import { ServerError } from '../utils/error';
import { conversationFactory } from './conversations';
import { LLM } from './llm';
import { Prompt } from './prompt';
import { QueryProps, SourceMetadata, SourceMetadataResponse } from './types';

class ChatFactory {
  public async create(user: User): Promise<Chat> {
    const createdChat = await mongoCreate(ChatModel, {
      name: 'New Chat',
      owner: user.id,
    } as EnforcedDoc<Chat>);
    if (createdChat === null) {
      throw new ServerError({
        status: 500,
        message: 'Error creating Chat',
        description: `Chat could not be created`,
      });
    }
    const collection = await createCollection(createdChat.id);
    if (collection === undefined) {
      await this.delete(createdChat.id);
      throw new ServerError({
        status: 500,
        message: 'Error creating collection',
        description: `Chat chroma collection could not be created`,
      });
    }
    return createdChat;
  }

  async delete(id: string): Promise<boolean> {
    await removeCollection(id);
    await deleteMany(SourceModel, { chat: id });
    await deleteMany(ConversationModel, { chat: id });
    const deleteStats = await deleteOne(ChatModel, { _id: id });
    return deleteStats.deletedCount > 1;
  }

  async getById(id: string): Promise<Chat> {
    return findById<Chat>(ChatModel, id) as Promise<Chat>;
  }

  async verifyOwner(id: string, owner: string): Promise<Boolean> {
    const chat = await findOne(ChatModel, { _id: id, owner });
    if (chat === null) {
      return false;
    }
    return true;
  }

  async getVector(id: string): Promise<Collection> {
    const collection = await findCollection(id);
    if (collection === undefined) {
      throw new ServerError({
        status: 500,
        message: 'Chat not found',
        description: `Could not find chroma collection for chat ${id}`,
      });
    }
    return collection;
  }

  async getSources(id: string): Promise<Source[]> {
    const res = await find<Source>(SourceModel, { chat: id });
    return res === null ? [] : res;
  }

  async updateName(query: string): Promise<Chat> {
    return updateOne(ChatModel, { query }, { name: query }) as Promise<Chat>;
  }

  async query(queryProps: QueryProps): Promise<Conversation | null> {
    const chat = await this.getById(queryProps.id);
    const collection = await this.getVector(queryProps.id);
    const ragSources = await queryCollection(queryProps.query, collection);

    const promptBuilder = new Prompt(queryProps.id, queryProps.query, ragSources);
    const llm = new LLM(promptBuilder);
    const llmResponse = await llm.generate();
    const conversation = await conversationFactory.create({
      chat: chat,
      query: queryProps.query,
      response: llmResponse,
    });
    void this.updateName(queryProps.query);
    return conversation;
  }

  async getConversations(id: string): Promise<Conversation[]> {
    return find<Conversation>(ConversationModel, { chat: id }) as Promise<Conversation[]>;
  }

  async getMetadata(id: string, metadata: string[]): Promise<SourceMetadataResponse> {
    const vector = await this.getVector(id);
    const response = await findByIds(metadata, vector);
    return response.ids.reduce(
      (acc: SourceMetadataResponse, v: string, i: number): SourceMetadataResponse => {
        acc[v] = response.metadatas[i] as SourceMetadata;
        return acc;
      },
      {},
    );
  }
}

export const chatFactory = new ChatFactory();
