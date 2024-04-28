import { DefaultContext, Next } from 'koa';
import { ChatFactory } from '../lib/chat';
import { SourceFactory } from '../lib/source';

export async function checkUserOwnsChat(ctx: DefaultContext, next: Next) {
  const chatId = ctx.request.body.chat ? ctx.request.body.chat : ctx.request.body.id;
  const response = await ChatFactory.verifyOwner(chatId, ctx.user.id);
  if (!response) {
    throw `400: You do not own this chat`;
  }
  await next();
}

export async function checkUserOwnsSource(ctx: DefaultContext, next: Next) {
  const sourceId = ctx.request.body.source ? ctx.request.body.source : ctx.request.body.id;
  const response = await SourceFactory.verifyOwner(sourceId, ctx.user.id);
  if (!response) {
    throw `400: You do not own this source`;
  }
  await next();
}
