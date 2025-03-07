import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';

export const handleBroadcastCommand = async (
  message: Discord.OmitPartialGroupDMChannel<Discord.Message>,
  generalChannel: Discord.GuildBasedChannel | undefined
): Promise<void> => {
  if (generalChannel && generalChannel.type === Discord.ChannelType.GuildText) {
    const authorId = message.author.id;
    if (await isAdmin(authorId)) {
      await generalChannel.send(`@everyone\n${message.content.split('\n').slice(1).join('\n')}`);
    } else {
      await message.channel.send('You are not in the list of admins, please do not try this command.');
    }
  }
};
