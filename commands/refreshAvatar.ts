import * as Discord from 'discord.js';
import { resolve } from 'path';

export const handleRefreshAvatar = (client: Discord.Client) => {
  client.user.setAvatar(resolve(__dirname, '..', 'IVAO_Logo.png'));
};
