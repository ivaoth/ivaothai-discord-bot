import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';

export const handleMoveVoiceUsersCommand = async (
  message: Discord.Message,
  guild: Discord.Guild
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    const [, fromChannelId, toChannelId] = message.content.split(' ');
    const fromChannel = guild.channels.cache.get(
      fromChannelId
    ) as Discord.VoiceChannel;
    const toChannel = guild.channels.cache.get(
      toChannelId
    ) as Discord.VoiceChannel;
    if (!(fromChannel && toChannel)) {
      message.channel.send('No such channels exists');
    } else {
      fromChannel.members.forEach((m) => {
        m.voice.setChannel(toChannel);
        message.channel.send(`Moved ${m.id}`);
      });
    }
  } else {
    message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
