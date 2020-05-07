import * as Discord from 'discord.js';
import { isAdmin } from '../utils/checkAdmin';
import { updateGuildMember } from './common/updateGuildMember';
import axios from 'axios';

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
  unverifiedRole: Discord.Role
): Promise<void> => {
  const authorId = message.author.id;
  if (await isAdmin(authorId)) {
    const userId = message.content.slice(12).trim();
    const user = await client.users.fetch(userId);
    const member = await guild.members.fetch(user);
    const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
    getUserDataUrl.searchParams.set('discord_id', userId);
    getUserDataUrl.searchParams.set('apiKey', process.env['API_KEY']!);
    const userData = (await axios.get(getUserDataUrl.href)).data;
    if (userData.success) {
      member.roles.remove(unverifiedRole);
      updateGuildMember(
        userData,
        member,
        verifiedRole,
        thailandDivisionRole,
        otherDivisionRole,
        thailandDivisionStaffRole,
        otherDivisionStaffRole,
        hqStaffRole
      );
    } else {
      message.author.createDM().then((dm) => {
        dm.send('No user data found.');
      });
      member.roles.add(unverifiedRole);
    }
  } else {
    message.channel.send(
      'You are not in the list of admins, please do not try this command.'
    );
  }
};
