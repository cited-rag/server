import Joi from 'joi';
import { DefaultContext, Next } from 'koa';
import { Origin } from '../lib/origin/types';
import { Url } from '../lib/origin/url';
import { sourceFactory } from '../lib/source';
import { verifyJWT } from '../middleware/auth';
import { checkUserOwnsChat, checkUserOwnsSource } from '../middleware/security';
import { DataType, OriginType, Source } from '../model/source';
import { resource } from '../utils/resource';
import { Methods } from './types';

export async function addUrlSource(ctx: DefaultContext, next: Next) {
  const { url, chat } = ctx.request.body;
  const source = {
    target: url,
    dataType: DataType.NONE,
    chat: chat,
    owner: ctx.user.id,
    origin: [{ target: ctx.request.body.url, type: OriginType.URL }],
  } as Source;
  const urlOrigin = new Url();
  ctx.body = await sourceFactory.create(source, urlOrigin as Origin);
  next();
}

export async function deleteSource(ctx: DefaultContext, next: Next) {
  ctx.body = await sourceFactory.delete(ctx.request.body.id);
  next();
}

export async function getSourceResolver(ctx: DefaultContext, next: Next) {
  ctx.body = await sourceFactory.getById(ctx.request.body.id);
  next();
}

export default resource([
  {
    path: '/url',
    controller: addUrlSource,
    method: Methods.POST,
    schema: Joi.object({
      chat: Joi.string().required(),
      url: Joi.string().uri().required(),
    }),
    security: [verifyJWT, checkUserOwnsChat],
  },
  {
    path: '/',
    controller: deleteSource,
    method: Methods.DELETE,
    schema: Joi.object({
      id: Joi.string().required(),
    }),
    security: [verifyJWT, checkUserOwnsSource],
  },
  {
    path: '/',
    controller: getSourceResolver,
    method: Methods.POST,
    schema: Joi.object({
      id: Joi.string().required(),
    }),
    security: [verifyJWT, checkUserOwnsSource],
  },
]);
