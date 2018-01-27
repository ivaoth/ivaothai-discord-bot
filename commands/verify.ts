import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { stripIndents } from 'common-tags';

export const handleVerify = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: any
) => {
  const userId = message.author.id;
  const token = admin
    .database()
    .ref('requests')
    .push(userId).key as string;
  const base64Token = Buffer.from(token, 'utf8').toString('base64');
  const callbackLink = new URL('https://sso.ivaothai.com/discord');
  callbackLink.searchParams.set('token', base64Token);
  const loginLink = new URL('https://login.ivao.aero/index.php');
  loginLink.searchParams.set('url', callbackLink.href);
  message.author.createDM().then(dm => {
    dm.send(stripIndents`
    กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord

    Please click the link below to link your VID with Discord.

    ${loginLink.href}`);
  });

  if (message.channel.id === generalChannel.id) {
    message.delete(5000);
  }
  const entry = log.entry(
    null,
    `[verify] received message from ${message.author.username}#${
      message.author.discriminator
    } (${message.author.id})`
  );
  log.write(entry);
};
