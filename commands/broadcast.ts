import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';

export const handleBroadcastCommand = async (
  message: Discord.Message,
  generalChannel: Discord.TextChannel
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    generalChannel.send(
      `@everyone\n${message.content.split('\n').slice(1).join('\n')}`
    );
  } else {
    message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
