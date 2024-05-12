import { DefaultContext, Middleware, Next } from 'koa';
import { ServerError } from '../utils/error';
import logger from '../utils/logger';

export type ProblemDetails = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  method: string;
};

export default function error(): Middleware {
  return async function (ctx: DefaultContext, next: Next) {
    try {
      await next();
    } catch (err) {
      const { message, status, description } = err as ServerError;
      ctx.status = isNaN(status) ? 500 : status;
      ctx.body = {
        type: 'error',
        title: message,
        status: ctx.status,
        detail: description,
        instance: ctx.request.url,
        method: ctx.request.method,
      } as ProblemDetails;
      if (ctx.status !== 200) {
        logger.error(ctx.body);
      }
    }
  };
}
