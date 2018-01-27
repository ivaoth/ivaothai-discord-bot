import * as functions from 'firebase-functions';
import axios from 'axios';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const privkey = functions.config().credentials;

admin.initializeApp({
  credential: admin.credential.cert(privkey),
  databaseURL: 'https://ivao-thailand-sso.firebaseio.com'
});

export const discord = functions.https.onRequest(async (request, response) => {
  const ivaoToken = request.query['IVAOTOKEN'];
  const token = Buffer.from(request.query['token'], 'base64').toString('utf8');
  if (ivaoToken === 'error') {
    response
      .status(500)
      .send('IVAO Login API is not configured for this domain')
      .end();
  } else {
    const ivaoApi = `https://login.ivao.aero/api.php?type=json&token=${ivaoToken}`;
    const userData = (await axios.get(ivaoApi)).data;
    const requestRef = admin
      .database()
      .ref('requests')
      .child(token);
    const _discordId: number = (await requestRef.once('value')).val();
    if (_discordId) {
      const discordId = _discordId.toString();
      await Promise.all([
        admin
          .database()
          .ref('users')
          .child(discordId.toString())
          .set(userData),
        requestRef.remove()
      ]);
      await admin
        .database()
        .ref('newUsers')
        .push(discordId.toString());
    }
    response
      .status(200)
      .send('เข้าสู่ระบบสำเร็จ\nLog In Successfully')
      .end();
  }
});
