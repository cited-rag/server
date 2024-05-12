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
import { ServerError } from '../utils/error';
import { chatFactory } from './chat';
import { JWTPayload } from './types';

class UserFactory {
  private hashString(password: string, salt?: string): { salt: string; hash: string } {
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

  public async checkNameExists(name: string): Promise<Boolean> {
    const user = await findOne<User>(UserModel, { name });
    return user !== null;
  }

  private validatePassword(user: User, sentPassword: string): void {
    const { hash } = this.hashString(sentPassword, user.salt);
    if (hash !== user.password) {
      throw new ServerError({
        status: 404,
        message: 'Invalid password',
        description: `Invalid password for ${user.name}`,
      });
    }
  }

  public async generateJWT(user: User): Promise<string> {
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

  private generateJWTPayload(user: User): JWTPayload {
    return {
      exp: dayjs().unix() + config.get('jwt.ttl'),
      sub: user.id,
    };
  }

  public async getByCred(name: string, password: string): Promise<User | null> {
    const user = await findOne(UserModel, { name });
    if (user !== null) {
      this.validatePassword(user, password);
    }
    return user;
  }

  public async create(name: string, password: string): Promise<User> {
    const { salt, hash } = this.hashString(password);
    const user = await create<User>(UserModel, { password: hash, name, salt } as EnforcedDoc<User>);
    if (user === null) {
      throw new ServerError({
        status: 404,
        message: 'Error creating user',
        description: `User ${name} could not be created`,
      });
    }
    return user as User;
  }

  public async getChats(user: User): Promise<Chat[]> {
    const res = await find<Chat>(ChatModel, { owner: user.id });
    return res === null ? [] : res;
  }

  public async delete(user: User): Promise<boolean> {
    const chats = await this.getChats(user);
    await Promise.all(chats.map(chat => chatFactory.delete(chat.id)));
    const deleteStats = await deleteOne(UserModel, { _id: user.id });
    return deleteStats.deletedCount > 1;
  }
}

export const userFactory = new UserFactory();
