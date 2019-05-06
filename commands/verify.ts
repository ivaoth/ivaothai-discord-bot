import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import axios from 'axios';

export const handleVerify = async (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: any
) => {
  const userId = message.author.id;
  const getKeyUrl = new URL('https://sso.th.ivao.aero/requestDiscordVerification');
  const result = (await axios.post(getKeyUrl.href, {
    discord_id: userId
  })).data;
  const callbackLink = new URL('https://sso.th.ivao.aero/discord');
  callbackLink.searchParams.set('key', result.key);
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
