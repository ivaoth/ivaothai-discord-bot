import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import axios from 'axios';
import { Log } from '@google-cloud/logging';

export const handleVerify = async (
  message: Discord.Message,
  log: Log
): Promise<void> => {
  const userId = message.author.id;
  const getKeyUrl = new URL(
    'https://sso.th.ivao.aero/requestDiscordVerification'
  );
  const result = (
    await axios.post(getKeyUrl.href, {
      discord_id: userId,
      apiKey: process.env['API_KEY']!
    })
  ).data;
  const callbackLink = new URL('https://sso.th.ivao.aero/discord');
  callbackLink.searchParams.set('key', result.key);
  const loginLink = new URL('https://login.ivao.aero/index.php');
  loginLink.searchParams.set('url', callbackLink.href);
  const dm = message.author.createDM();
  await (await dm).send(stripIndents`
    กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord

    Please click the link below to link your VID with Discord.

    ${loginLink.href}`);

  const entry = log.entry(
    undefined,
    `[verify] received message from ${message.author.username}#${message.author.discriminator} (${message.author.id})`
  );
  await log.write(entry);
};
