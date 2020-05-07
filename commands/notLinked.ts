import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { notifyNotLinked } from './common/notifyNotLinked';

export const handleNotLinked = async (
  message: Discord.Message,
  guild: Discord.Guild,
  verifiedRole: Discord.Role
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    guild.members.cache.forEach((member) => {
      if (!member.roles.cache.some((r) => r.id === verifiedRole.id)) {
        member.createDM().then((dm) => {
          notifyNotLinked(dm);
        });
      }
    });
  } else {
    message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
