import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { notifyNotLinked } from './common/notifyNotLinked';

export const handleNotLinked = (message: Discord.Message, guild: Discord.Guild, verifiedRole: Discord.Role) => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', v => {
      if (v.exists()) {
        guild.members.cache.forEach(member => {
          if (!member.roles.cache.some(r => r.id === verifiedRole.id)) {
            member.createDM().then(dm => {
              notifyNotLinked(dm);
            });
          }
        });
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
