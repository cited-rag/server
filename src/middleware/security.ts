import { DefaultContext, Next } from 'koa';
import { chatFactory } from '../lib/chat';
import { sourceFactory } from '../lib/source';
import { ServerError } from '../utils/error';

export async function checkUserOwnsChat(ctx: DefaultContext, next: Next) {
  const chatId = ctx.request.body.chat ? ctx.request.body.chat : ctx.request.body.id;
  const response = await chatFactory.verifyOwner(chatId, ctx.user.id);
  if (!response) {
    throw new ServerError({
      status: 404,
      message: 'Chat not found',
      description: `You do not own this chat`,
    });
  }
  await next();
}

export async function checkUserOwnsSource(ctx: DefaultContext, next: Next) {
  const sourceId = ctx.request.body.source ? ctx.request.body.source : ctx.request.body.id;
  const response = await sourceFactory.verifyOwner(sourceId, ctx.user.id);
  if (!response) {
    throw new ServerError({
      status: 404,
      message: 'Source not found',
      description: `You do not own this source`,
    });
  }
  await next();
}
