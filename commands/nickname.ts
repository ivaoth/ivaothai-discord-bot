import * as Discord from 'discord.js';
import axios from 'axios';

export const handleNicknameChange = async (
  message: Discord.Message
): Promise<void> => {
  const newNickname = message.content.slice(9).trim();
  const setNicknameUrl = new URL(`${process.env['API_BASE_URI']!}/setNickname`);
  await axios.patch(setNicknameUrl.href, {
    discord_id: message.author.id,
    nickname: newNickname,
    apiKey: process.env['API_KEY']!
  });
  await message.author.createDM().then((dm) => {
    return dm.send('Nickname changed!');
  });
};
