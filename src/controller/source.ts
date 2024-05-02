import Joi from "joi";
import { DefaultContext, Next } from "koa";
import { ISource, SourceFactory } from "../lib/source";
import { Url } from "../lib/source/url";
import { verifyJWT } from "../middleware/auth";
import { checkUserOwnsChat, checkUserOwnsSource } from "../middleware/security";
import { Source, SourceType } from "../model/source";
import { resource } from "../utils/resource";
import { Methods } from "./types";

export async function addUrlSource(ctx: DefaultContext, next: Next) {
	const urlSource = new Url({
		target: ctx.request.body.url,
		type: SourceType.URL,
		chat: ctx.request.body.chat,
		owner: ctx.user.id,
	} as Source);
	ctx.body = await SourceFactory.create(urlSource as ISource);
	next();
}

export async function deleteSource(ctx: DefaultContext, next: Next) {
	ctx.body = await SourceFactory.delete(ctx.request.body.id);
	next();
}

export async function getSourceResolver(ctx: DefaultContext, next: Next) {
	ctx.body = await SourceFactory.getById(ctx.request.body.id);
	next();
}

export default resource([
	{
		path: "/url",
		controller: addUrlSource,
		method: Methods.POST,
		schema: Joi.object({
			chat: Joi.string().required(),
			url: Joi.string().uri().required(),
		}),
		security: [verifyJWT, checkUserOwnsChat],
	},
	{
		path: "/",
		controller: deleteSource,
		method: Methods.DELETE,
		schema: Joi.object({
			id: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsSource],
	},
	{
		path: "/",
		controller: getSourceResolver,
		method: Methods.POST,
		schema: Joi.object({
			id: Joi.string().required(),
		}),
		security: [verifyJWT, checkUserOwnsSource],
	},
]);
