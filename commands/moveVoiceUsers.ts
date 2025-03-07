import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';

export const handleMoveVoiceUsersCommand = async (
  message: Discord.OmitPartialGroupDMChannel<Discord.Message>,
  guild: Discord.Guild
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    const [, fromChannelId, toChannelId] = message.content.split(' ');
    const fromChannel = guild.channels.cache.get(fromChannelId);
    const toChannel = guild.channels.cache.get(toChannelId);
    if (isVoiceChannel(fromChannel) && isVoiceChannel(toChannel)) {
      for (const [, m] of fromChannel.members) {
        await m.voice.setChannel(toChannel);
        await message.channel.send(`Moved ${m.user.username}#${m.user.discriminator}`);
      }
    } else {
      void message.channel.send('No such channels exists');
    }
  } else {
    await message.channel.send('You are not in the list of admins, please do not try this command.');
  }
};

const isVoiceChannel = (channel: Discord.GuildBasedChannel | undefined): channel is Discord.VoiceChannel => {
  if (channel) {
    return channel.type === Discord.ChannelType.GuildVoice;
  }
  return false;
};
