import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

export const handleDeleteMessageAfter = async (message: Discord.Message, guild: Discord.Guild) => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', async v => {
      if (v.exists()) {
        const [, channelId, messageId] = message.content.split(' ');
        const channel = guild.channels.cache.get(
          channelId,
        ) as Discord.TextChannel;
        const messages = await channel.messages.fetch({after: messageId, limit: 1000});
        for (const m of messages) {
          channel.messages.delete(m[1]);
        }
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
}
