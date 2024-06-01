import Joi from 'joi';
import { DefaultContext, Next } from 'koa';
import { chatFactory } from '../lib/chat';
import { verifyJWT } from '../middleware/auth';
import { checkUserOwnsChat } from '../middleware/security';
import { resource } from '../utils/resource';
import { Methods } from './types';

export async function createNewChat(ctx: DefaultContext, next: Next) {
	ctx.body = await chatFactory.create(ctx.user);
	next();
}

export async function getChatSources(ctx: DefaultContext, next: Next) {
	ctx.body = await chatFactory.getSources(ctx.request.body.id);
	next();
}

export async function getChat(ctx: DefaultContext, next: Next) {
	ctx.body = await chatFactory.getById(ctx.request.body.id);
	next();
}

export async function deleteChat(ctx: DefaultContext, next: Next) {
	ctx.body = await chatFactory.delete(ctx.request.body.id);
	next();
}

export async function queryChat(ctx: DefaultContext, next: Next) {
	const queryId = chatFactory.query(ctx.request.body);
	ctx.body = { response: { queryId } };
	next();
}

export async function getConversations(ctx: DefaultContext, next: Next) {
	ctx.body = await chatFactory.getConversations(ctx.request.body.id);
	next();
}

export async function getSourceMetadata(ctx: DefaultContext, next: Next) {
	const { id, metadata } = ctx.request.body;
	ctx.body = await chatFactory.getMetadata(id, metadata);
	next();
}

export default resource([
	{
		path: '/',
		controller: createNewChat,
		method: Methods.PUT,
		security: [verifyJWT],
	},
	{
		path: '/sources',
		controller: getChatSources,
		method: Methods.POST,
		security: [verifyJWT, checkUserOwnsChat],
		schema: Joi.object({
			id: Joi.string().required(),
		}),
	},
	{
		path: '/',
		controller: getChat,
		method: Methods.POST,
		schema: Joi.object({
			id: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
	{
		path: '/',
		controller: deleteChat,
		method: Methods.DELETE,
		schema: Joi.object({
			id: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
	{
		path: '/query',
		controller: queryChat,
		method: Methods.POST,
		schema: Joi.object({
			id: Joi.string().required(),
			query: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
	{
		path: '/conversations',
		controller: getConversations,
		method: Methods.POST,
		schema: Joi.object({
			id: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
	{
		path: '/sources/metadata',
		controller: getSourceMetadata,
		method: Methods.POST,
		schema: Joi.object({
			id: Joi.string().required(),
			metadata: Joi.array().items(Joi.string()).required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
]);
