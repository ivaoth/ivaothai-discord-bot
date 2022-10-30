import * as Discord from 'discord.js';
import axios from 'axios';
import { Log } from '@google-cloud/logging';

export const handleNicknameChange = async (
  message: Discord.Message,
  log: Log
): Promise<void> => {
  const newNickname = message.content.slice(9).trim();
  const setNicknameUrl = new URL(`${process.env['API_BASE_URI']!}/setNickname`);
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
};
