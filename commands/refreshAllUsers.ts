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
    for (const [, member] of guild.members.cache) {
      const user = member.user;
      const uid = user.id;
      const userData = await getUserData(uid);
      await updateGuildMember(
        userData,
        member,
        verifiedRole,
        thailandDivisionRole,
        otherDivisionRole,
        thailandDivisionStaffRole,
        otherDivisionStaffRole,
        hqDivisionStaffRole,
        unverifiedRole
      );
    }
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
