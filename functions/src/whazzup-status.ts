import axios from 'axios';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const whazzupStatus = functions.https.onRequest(async (req, resp) => {
  const data = (await axios.get<string>(
    'https://www.ivao.aero/whazzup/status.txt'
  )).data;
  const config: any = {};
  const lines = data
    .split('\n')
    .map(l => l.trim())
    .filter(l => !l.startsWith(';') && !l.startsWith('#') && l !== '');
  for (const line of lines) {
    const [key, value] = line.split('=').map(l => l.trim());
    if (value) {
      if (!(config as Object).hasOwnProperty(key)) {
        config[key] = [];
      }
      (config[key] as string[]).push(value);
    }
  }
  await admin.firestore().collection('whazzup').doc('config').set(config);
  resp
    .status(200)
    .send(config)
    .end();
});
