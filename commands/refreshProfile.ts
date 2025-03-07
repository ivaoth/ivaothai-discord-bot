import * as Discord from 'discord.js';
import { resolve } from 'path';

export const handleRefreshProfile = async (client: Discord.Client, guild: Discord.Guild): Promise<void> => {
  if (client.user) {
    await client.user.setAvatar(resolve(__dirname, '..', 'IVAO_Logo.png'));
    await client.user.setUsername('ivao-bot');
    await guild.members.fetch(client.user).then((gm) => {
      return gm.setNickname('IVAO Bot');
    });
  }
};
