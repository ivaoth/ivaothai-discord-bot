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
  unverifiedRole: Discord.Role,
  botRole: Discord.Role
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    let count = 0;
    const total = guild.members.cache.size;
    for (const [, member] of guild.members.cache) {
      const user = member.user;
      const uid = user.id;
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
          unverifiedRole,
          botRole
        );
        count += 1;
        await message.channel.send(
          `[${count}/${total}] Updated ${user.username}#${user.discriminator} (${user.id})`
        );
      } else {
        await message.channel.send(
          `[${count}/${total}] Failed to fetch data for ${user.username}#${user.discriminator} (${user.id})`
        );
      }
    }
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
