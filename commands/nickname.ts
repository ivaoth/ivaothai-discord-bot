import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import axios from 'axios';
import { Log } from '@google-cloud/logging';
import { getUserData } from '../utils/getUserData';

export const handleNicknameChange = async (
  message: Discord.Message,
  log: Log
): Promise<void> => {
  const userdata = await getUserData(message.author.id);
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
    await log.write(entry);
    await message.author.createDM().then((dm) => {
      return dm.send('Nickname changed!');
    });
  } else {
    await message.author.createDM().then((dm) => {
      return dm.send(stripIndents`
          คุณยังไม่ได้เชื่อมต่อ IVAO Account ของคุณ
          กรุณาใช้คำสั่ง \`!verify\` เพื่อเชื่อมต่อ

          You have not linked your IVAO Account yet.
          Please use the command \`!verify\` to link your IVAO Account.'`);
    });
  }
};
