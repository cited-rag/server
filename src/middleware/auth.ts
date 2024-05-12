import dayjs from 'dayjs';
import http from 'http';
import { DefaultContext, Next } from 'koa';
import { JWS } from 'node-jose';
import { findOne } from '../db/mongo/queries/find';
import { JWTPayload } from '../lib/types';
import { User, UserModel } from '../model/user';
import { getKey } from '../utils/auth';
import { ServerError } from '../utils/error';

export function checkExpired(payload: JWTPayload): void {
  if (dayjs().unix() > payload.exp) {
    throw `404: Expired JWT`;
  }
}

export function getJWT(ctx: DefaultContext): string {
  const jwt = ctx.headers['authorization'];
  if (!jwt) {
    throw new ServerError({
      status: 400,
      message: 'Invalid JWT',
      description: `No JWT sent in header`,
    });
  }
  return jwt;
}

export async function getUserFromJWT(payload: JWTPayload): Promise<User> {
  const user = await findOne(UserModel, { _id: payload.sub });
  if (user === null) {
    throw new ServerError({
      status: 400,
      message: 'Invalid JWT',
      description: `JWT user not found in database`,
    });
  }
  return user;
}

async function verifyToken(token: string) {
  const key = await getKey('sig');
  let parsedPayload: JWTPayload;
  try {
    const result = await JWS.createVerify(key).verify(token);
    parsedPayload = JSON.parse(result.payload.toString()) as JWTPayload;
  } catch (err) {
    throw new ServerError({
      status: 400,
      message: 'Invalid JWT',
      description: `JWT could not be verified`,
    });
  }
  checkExpired(parsedPayload);
  return parsedPayload;
}

export async function verifyJWT(ctx: DefaultContext, next: Next) {
  const jwt = getJWT(ctx);
  const parsedPayload = await verifyToken(jwt);
  ctx.user = await getUserFromJWT(parsedPayload);
  await next();
}

export async function verifyJWTSocket(header: http.IncomingHttpHeaders) {
  const jwt = header['authorization'];
  if (!jwt) {
    throw new ServerError({
      status: 400,
      message: 'Invalid JWT',
      description: `No JWT sent in header`,
    });
  }
  const parsedPayload = await verifyToken(jwt);
  return parsedPayload;
}
