import { pbkdf2Sync, randomBytes } from 'crypto';
import dayjs from 'dayjs';
import { JWS } from 'node-jose';
import config from '../config';
import { create } from '../db/mongo/queries/create';
import { deleteOne } from '../db/mongo/queries/delete';
import { find, findOne } from '../db/mongo/queries/find';
import { EnforcedDoc } from '../db/mongo/queries/types';
import { Chat, ChatModel } from '../model/chat';
import { User, UserModel } from '../model/user';
import { getKey } from '../utils/auth';
import { ChatFactory } from './chat';
import { JWTPayload } from './types';

export class UserFactory {
  private static hashString(password: string, salt?: string): { salt: string; hash: string } {
    salt = salt ? salt : randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(
      password,
      salt,
      config.get('password.iterations'),
      64,
      'sha512',
    ).toString('hex');
    return { salt, hash };
  }

  public static async checkNameExists(name: string): Promise<Boolean> {
    const user = await findOne<User>(UserModel, { name });
    return user !== null;
  }

  private static validatePassword(user: User, sentPassword: string): void {
    const { hash } = this.hashString(sentPassword, user.salt);
    if (hash !== user.password) {
      throw `404: Invalid password`;
    }
  }

  public static async generateJWT(user: User): Promise<string> {
    const token = await JWS.createSign(
      {
        format: 'compact',
      },
      await getKey('sig'),
    )
      .update(JSON.stringify(this.generateJWTPayload(user)))
      .final();
    return token.toString();
  }

  private static generateJWTPayload(user: User): JWTPayload {
    return {
      exp: dayjs().unix() + config.get('jwt.ttl'),
      sub: user.id,
    };
  }

  public static async getByCred(name: string, password: string): Promise<User | null> {
    const user = await findOne(UserModel, { name });
    if (user !== null) {
      this.validatePassword(user, password);
    }
    return user;
  }

  public static async create(name: string, password: string): Promise<User> {
    const { salt, hash } = this.hashString(password);
    const user = await create<User>(UserModel, { password: hash, name, salt } as EnforcedDoc<User>);
    if (user === null) {
      throw `500: Error creating user`;
    }
    return user as User;
  }

  public static async getChats(user: User): Promise<Chat[]> {
    const res = await find<Chat>(ChatModel, { owner: user.id });
    return res === null ? [] : res;
  }

  public static async delete(user: User): Promise<boolean> {
    const chats = await this.getChats(user);
    await Promise.all(chats.map(chat => ChatFactory.delete(chat.id)));
    const deleteStats = await deleteOne(UserModel, { _id: user.id });
    return deleteStats.deletedCount > 1;
  }
}
