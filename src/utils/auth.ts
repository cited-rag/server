import * as fs from 'fs';
import { JWK } from 'node-jose';

//TODO: move to class and init on startup
export async function getKey(type: JWK.KeyUse): Promise<JWK.Key> {
  const keyStore = await JWK.asKeyStore((await fs.readFileSync('./keys/rsa.json')).toString());
  const [key] = keyStore.all({ use: type });
  return key;
}
