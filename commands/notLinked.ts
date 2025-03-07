import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { notifyNotLinked } from './common/notifyNotLinked';

export const handleNotLinked = async (
  message: Discord.OmitPartialGroupDMChannel<Discord.Message>,
  guild: Discord.Guild,
  verifiedRole: Discord.Role | undefined
): Promise<void> => {
  if (verifiedRole) {
    const authorId = message.author.id;
    if (await isAdmin(authorId)) {
      for (const [, member] of guild.members.cache) {
        if (!member.roles.cache.some((r) => r.id === verifiedRole.id)) {
          await member.createDM().then((dm) => {
            void notifyNotLinked(dm);
          });
        }
      }
    } else {
      await message.channel.send('You are not in the list of admins, please do not try this command.');
    }
  }
};
