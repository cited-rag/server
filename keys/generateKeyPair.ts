import * as fs from 'fs';
import * as jose from 'node-jose';

const keyStore = jose.JWK.createKeyStore();
keyStore.generate('RSA', 2048, { alg: 'RS256', use: 'sig' }).then(result => {
  fs.writeFileSync('./keys/rsa.json', JSON.stringify(keyStore.toJSON(true), null, '  '));
});
