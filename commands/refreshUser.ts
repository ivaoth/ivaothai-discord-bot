import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { updateGuildMember } from './common/updateGuildMember';
import { getUserData } from '../utils/getUserData';

export const handleRefreshUser = async (
  message: Discord.Message,
  client: Discord.Client,
  guild: Discord.Guild,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  thailandDivisionStaffRole: Discord.Role,
  otherDivisionStaffRole: Discord.Role,
  hqStaffRole: Discord.Role,
  unverifiedRole: Discord.Role,
  botRole: Discord.Role
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    const userId = message.content.slice(12).trim();
    const user = await client.users.fetch(userId);
    const member = await guild.members.fetch(user);
    const userData = await getUserData(userId);
    await updateGuildMember(
      userData,
      member,
      verifiedRole,
      thailandDivisionRole,
      otherDivisionRole,
      thailandDivisionStaffRole,
      otherDivisionStaffRole,
      hqStaffRole,
      unverifiedRole,
      botRole
    );
  } else {
    await message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
