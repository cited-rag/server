import { parse as bestJsonParse } from 'best-effort-json-parser';
import { Collection } from 'chromadb';
import Joi from 'joi';
import Stream from 'stream';
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
import { emitEvent } from '../socket';
import { SocketEvents, SocketExceptionAction } from '../socket/types';
import { ServerError } from '../utils/error';
import { conversationFactory } from './conversations';
import { Vertex } from './llm/vertex';
import { QueryPrompt } from './prompt/query';
import {
	QueryProps,
	QueryRes,
	SourceMetadata,
	SourceMetadataResponse,
} from './types';
import mongoose from 'mongoose';

class ChatFactory {
	private defaultName = 'New Chat';

	public async create(user: User): Promise<Chat> {
		const createdChat = await mongoCreate(ChatModel, {
			name: this.defaultName,
			owner: user.id,
		} as unknown as EnforcedDoc<Chat>);
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

	async updateName(chat: Chat, query: string): Promise<Chat> {
		if (chat.name === this.defaultName) {
			updateOne(ChatModel, { _id: chat.id }, { name: query }) as Promise<Chat>;
			emitEvent(chat.owner, SocketEvents.UPDATE, {
				collection: ChatModel.collection.name,
				id: chat.id,
				update: { name: query },
			});
		}
		return chat;
	}

	private buildJsonResponse(response: string): QueryRes {
		const validationSchema = Joi.object({
			response: Joi.string().required(),
			sources: Joi.array().items(Joi.string()).required(),
		});
		try {
			const jsonResponse = JSON.parse(response) as QueryRes;
			Joi.assert(jsonResponse, validationSchema);
			return jsonResponse;
		} catch (err) {
			return { response: null, sources: null };
		}
	}

	private async parseReadStream(
		queryId: string,
		chat: Chat,
		readStream: Stream.Readable
	): Promise<string> {
		let response: string = '';
		let responseJson: Record<string, any> = {};
		for await (const chunk of readStream) {
			response += chunk;
			responseJson = bestJsonParse(response);
			emitEvent(chat.owner.toString(), SocketEvents.RESPONSE, {
				id: queryId,
				chatId: chat.id,
				type: 'response',
				response: responseJson,
			});
		}
		return response;
	}

	private async makeQuery(queryProps: QueryProps): Promise<void> {
		const chat = await this.getById(queryProps.id);
		const collection = await this.getVector(queryProps.id);
		const ragSources = await queryCollection(queryProps.query, collection);

		const promptBuilder = new QueryPrompt(
			queryProps.id,
			queryProps.query,
			ragSources
		);
		const llm = new Vertex(promptBuilder);
		const readStream = await llm.generate();
		const stringResponse = await this.parseReadStream(
			queryProps.queryId,
			chat,
			readStream
		);
		const jsonResponse = this.buildJsonResponse(stringResponse);
		if (jsonResponse.response === null) {
			emitEvent(chat.owner, SocketEvents.EXCEPTION, {
				action: SocketExceptionAction.QUERY,
				message: `Query response was invalid`,
			});
		}
		await conversationFactory.create({
			chat: chat,
			query: queryProps.query,
			queryId: queryProps.queryId,
			response: jsonResponse,
		});
		void this.updateName(chat, queryProps.query);
	}

	query(queryProps: Partial<QueryProps>): string {
		const queryId = new mongoose.Types.ObjectId().toHexString();
		void this.makeQuery({
			queryId: queryId,
			id: queryProps.id!,
			query: queryProps.query!,
		});

		return queryId;
	}

	async getConversations(id: string): Promise<Conversation[]> {
		return find<Conversation>(ConversationModel, { chat: id }) as Promise<
			Conversation[]
		>;
	}

	async getMetadata(
		id: string,
		metadata: string[]
	): Promise<SourceMetadataResponse> {
		const vector = await this.getVector(id);
		const response = await findByIds(metadata, vector);
		return response.ids.reduce(
			(
				acc: SourceMetadataResponse,
				v: string,
				i: number
			): SourceMetadataResponse => {
				acc[v] = response.metadatas[i] as SourceMetadata;
				return acc;
			},
			{}
		);
	}
}

export const chatFactory = new ChatFactory();
