import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { refreshAllUsers } from '../utils/refreshUser';

export const handleRefreshAllUsers = async (
  message: Discord.Message
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    await refreshAllUsers();
    await message.channel.send('All users updated');
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
