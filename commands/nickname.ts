import * as Discord from 'discord.js';
import axios from 'axios';

export const handleNicknameChange = async (
  message: Discord.OmitPartialGroupDMChannel<Discord.Message>
): Promise<void> => {
  const apiBaseUri = process.env['API_BASE_URI'];
  const apiKey = process.env['API_KEY'];
  if (apiBaseUri && apiKey) {
    const newNickname = message.content.slice(9).trim();
    const setNicknameUrl = new URL(`${apiBaseUri}/setNickname`);
    await axios.patch(setNicknameUrl.href, {
      discord_id: message.author.id,
      nickname: newNickname,
      apiKey
    });
    await message.author.createDM().then((dm) => {
      return dm.send('Nickname changed!');
    });
  } else {
    await message.author.createDM().then((dm) => {
      return dm.send('The application is not configured.');
    });
  }
};
