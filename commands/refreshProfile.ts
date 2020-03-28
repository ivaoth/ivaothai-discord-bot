import * as Discord from 'discord.js';
import { resolve } from 'path';

export const handleRefreshProfile = (client: Discord.Client, guild: Discord.Guild) => {
  client.user!.setAvatar(resolve(__dirname, '..', 'IVAO_Logo.png'));
  client.user!.setUsername('ivao-bot');
  guild.members.fetch(client.user!).then(gm => {
    gm.setNickname('IVAO Bot');
  });
};
