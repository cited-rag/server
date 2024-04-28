import dayjs from 'dayjs';
import { DefaultContext, Next } from 'koa';
import { JWS } from 'node-jose';
import { findOne } from '../db/mongo/queries/find';
import { JWTPayload } from '../lib/types';
import { User, UserModel } from '../model/user';
import { getKey } from '../utils/auth';

export function checkExpired(payload: JWTPayload): void {
  if (dayjs().unix() > payload.exp) {
    throw `404: Expired JWT`;
  }
}

export function getJWT(ctx: DefaultContext): string {
  const jwt = ctx.headers['authorization'];
  if (!jwt) {
    throw `404: Invalid JWT`;
  }
  return jwt;
}

export async function getUserFromJWT(payload: JWTPayload): Promise<User> {
  const user = await findOne(UserModel, { _id: payload.sub });
  if (user === null) {
    throw `404: Invalid JWT`;
  }
  return user;
}

export async function verifyJWT(ctx: DefaultContext, next: Next) {
  const jwt = getJWT(ctx);
  let parsedPayload: JWTPayload;
  const key = await getKey('sig');
  try {
    const result = await JWS.createVerify(key).verify(jwt);
    parsedPayload = JSON.parse(result.payload.toString()) as JWTPayload;
  } catch (err) {
    throw `404: Invalid JWT`;
  }
  checkExpired(parsedPayload);
  ctx.user = await getUserFromJWT(parsedPayload);
  await next();
}
