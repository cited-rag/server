import Router from '@koa/router';
import type { Middleware } from 'koa';
import compose from 'koa-compose';
import authRouter from './controller/auth';
import chatRouter from './controller/chat';
import source from './controller/source';
import user from './controller/user';

const router = new Router();

router.get('/', async (ctx, _next) => {
  ctx.body = 'Welcome to cited RAG server';
});

router.use('/auth', authRouter.routes(), authRouter.allowedMethods());
router.use('/chat', chatRouter.routes(), chatRouter.allowedMethods());
router.use('/source', source.routes(), source.allowedMethods());
router.use('/user', user.routes(), user.allowedMethods());

export default (): Middleware => {
  return compose([router.routes(), router.allowedMethods()]) as Middleware;
};
