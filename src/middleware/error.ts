import { DefaultContext, Middleware, Next } from 'koa';
import logger from '../utils/logger';

export default function (): Middleware {
  return async function (ctx: DefaultContext, next: Next) {
    try {
      await next();
    } catch (err) {
      if (typeof err === 'string') {
        let lMatches = err.match(/^(\d{3}):\s*(.*)$/);
        if (lMatches) {
          ctx.status = parseInt(lMatches[1]);
          ctx.body = lMatches[2];
          if (ctx.status != 200) {
            logger.error(ctx.body);
          }
        }
      }
    }
  };
}
