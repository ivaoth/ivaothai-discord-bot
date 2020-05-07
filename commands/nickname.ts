import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import axios from 'axios';
import { Log } from '@google-cloud/logging';

export const handleNicknameChange = async (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: Log
): Promise<void> => {
  const getUserUrl = new URL('https://sso.th.ivao.aero/getUser');
  getUserUrl.searchParams.set('discord_id', message.author.id);
  getUserUrl.searchParams.set('apiKey', process.env['API_KEY']!);
  const userdata = (await axios.get(getUserUrl.href)).data;

  if (userdata.success) {
    const newNickname = message.content.slice(9).trim();

    const setNicknameUrl = new URL('https://sso.th.ivao.aero/setNickname');
    await axios.patch(setNicknameUrl.href, {
      discord_id: message.author.id,
      nickname: newNickname,
      apiKey: process.env['API_KEY']!
    });
    const entry = log.entry(
      undefined,
      `[nickname] change nickname of ${message.author.username}#${message.author.discriminator} (${message.author.id}) to ${newNickname}`
    );
    log.write(entry);
    message.author.createDM().then((dm) => {
      dm.send('Nickname changed!');
    });
    if (message.channel.id === generalChannel.id) {
      message.delete({ timeout: 5000 });
    }
  } else {
    message.author.createDM().then((dm) => {
      dm.send(stripIndents`
          คุณยังไม่ได้เชื่อมต่อ IVAO Account ของคุณ
          กรุณาใช้คำสั่ง \`!verify\` เพื่อเชื่อมต่อ

          You have not linked your IVAO Account yet.
          Please use the command \`!verify\` to link your IVAO Account.'`);
    });
  }
};
