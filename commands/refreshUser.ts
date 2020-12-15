import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { refreshUser } from '../utils/refreshUser';

export const handleRefreshUser = async (
  message: Discord.Message
): Promise<void> => {
  const authorId = message.author.id;
  if (message.webhookID || (await isAdmin(authorId))) {
    const userId = message.content.slice(12).trim();
    await refreshUser(userId);
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
