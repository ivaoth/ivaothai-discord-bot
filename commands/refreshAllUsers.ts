import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { updateGuildMember } from './common/updateGuildMember';
import axios from 'axios';

export const handleRefreshAllUsers = async (
  message: Discord.Message,
  client: Discord.Client,
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
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', async (v) => {
      if (v.exists()) {
        guild.members.cache.forEach(async (member) => {
          const user = member.user;
          const uid = user.id;
          const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
          getUserDataUrl.searchParams.set('discord_id', uid);
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
              hqDivisionStaffRole
            );
          } else {
            message.author.createDM().then((dm) => {
              dm.send('No user data found.');
            });
            member.roles.add(unverifiedRole);
          }
        });
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
