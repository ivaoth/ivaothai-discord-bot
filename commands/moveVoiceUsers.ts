import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

export const handleMoveVoiceUsersCommand = (
  message: Discord.Message,
  guild: Discord.Guild
): void => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', (v) => {
      if (v.exists()) {
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
    });
};
