import Joi from 'joi';
import { DefaultContext, Next } from 'koa';
import { userFactory } from '../lib/user';
import { resource } from '../utils/resource';
import { Methods } from './types';

export async function login(ctx: DefaultContext, next: Next) {
  let user = await userFactory.getByCred(ctx.request.body.name, ctx.request.body.password);
  if (user === null) {
    user = await userFactory.create(ctx.request.body.name, ctx.request.body.password);
  }
  const jwt = await userFactory.generateJWT(user);
  ctx.body = { jwt };
  next();
}

export async function validateName(ctx: DefaultContext, next: Next) {
  ctx.body = {
    response: await userFactory.checkNameExists(ctx.request.body.name),
  };
  next();
}

export default resource([
  {
    path: '/login',
    controller: login,
    method: Methods.POST,
    schema: Joi.object({
      password: Joi.string().min(5).required(),
      name: Joi.string().required(),
    }),
  },
  {
    path: '/name',
    controller: validateName,
    method: Methods.POST,
    schema: Joi.object({
      name: Joi.string().required(),
    }),
  },
]);
