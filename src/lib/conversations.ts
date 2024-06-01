import { create } from '../db/mongo/queries/create';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { Conversation, ConversationModel } from '../model/conversation';
import { ConversationCreateProps } from './types';

export class ConversationFactory {
	public async create(
		props: ConversationCreateProps
	): Promise<Conversation | null> {
		const conversation: Conversation = {
			id: props.queryId,
			sources: props.response.sources,
			chat: props.chat.id,
			owner: props.chat.owner,
			query: props.query,
			response: props.response.response,
		} as Conversation;
		return create(ConversationModel, conversation as EnforcedDoc<Conversation>);
	}
}

export const conversationFactory = new ConversationFactory();
