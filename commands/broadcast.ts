import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

export const handleBroadcastCommand = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel
) => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', v => {
      if (v.exists()) {
        generalChannel.send(
          `@everyone\n${message.content
            .split('\n')
            .slice(1)
            .join('\n')}`
        );
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
