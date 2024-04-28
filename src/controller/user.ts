import { DefaultContext, Next } from 'koa';
import { UserFactory } from '../lib/user';
import { verifyJWT } from '../middleware/auth';
import { resource } from '../utils/resource';
import { Methods } from './types';

export async function deleteUser(ctx: DefaultContext, next: Next) {
  ctx.body = { response: UserFactory.delete(ctx.user) };
  next();
}

export async function getMe(ctx: DefaultContext, next: Next) {
  ctx.body = ctx.user;
  next();
}

export async function getUserChats(ctx: DefaultContext, next: Next) {
  ctx.body = await UserFactory.getChats(ctx.user);
  next();
}

export default resource([
  {
    path: '/',
    controller: deleteUser,
    method: Methods.DELETE,
    security: [verifyJWT],
  },
  {
    path: '/me',
    controller: getMe,
    method: Methods.GET,
    security: [verifyJWT],
    props: ['id', 'name'],
  },
  {
    path: '/chats',
    controller: getUserChats,
    method: Methods.GET,
    security: [verifyJWT],
  },
]);
