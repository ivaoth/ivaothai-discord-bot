import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { updateGuildMember } from './common/updateGuildMember';
import { getUserData } from '../utils/getUserData';

export const handleRefreshAllUsers = async (
  message: Discord.Message,
  guild: Discord.Guild,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  thailandDivisionStaffRole: Discord.Role,
  otherDivisionStaffRole: Discord.Role,
  hqDivisionStaffRole: Discord.Role,
  unverifiedRole: Discord.Role
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    await Promise.all(
      guild.members.cache.map(async (member) => {
        return (async (): Promise<void> => {
          const user = member.user;
          const uid = user.id;
          if (uid !== message.client.user!.id) {
            const userData = await getUserData(uid);
            if (userData.status === 'success') {
              await updateGuildMember(
                userData.data,
                member,
                verifiedRole,
                thailandDivisionRole,
                otherDivisionRole,
                thailandDivisionStaffRole,
                otherDivisionStaffRole,
                hqDivisionStaffRole,
                unverifiedRole
              );
            } else {
              await message.channel.send(
                `Data fetch failed for ${user.username}#${user.discriminator} (${uid})`
              );
            }
          } else {
            console.log('We are skipping ourselves.');
          }
        })();
      })
    );
    await message.channel.send('All users updated');
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
