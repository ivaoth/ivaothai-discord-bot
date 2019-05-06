import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { updateGuildMember } from './common/updateGuildMember';
import axios from 'axios';

export const handleRefreshUser = (
  message: Discord.Message,
  client: Discord.Client,
  guild: Discord.Guild,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role
) => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', async v => {
      if (v.exists()) {
        const userId = message.content.slice(12).trim();
        const user = await client.fetchUser(userId);
        const member = await guild.fetchMember(user);
        const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
        getUserDataUrl.searchParams.set('discord_id', userId);
        const userData = (await axios.get(getUserDataUrl.href)).data;
          if (userData.success) {
            updateGuildMember(
              userData,
              member,
              verifiedRole,
              thailandDivisionRole,
              otherDivisionRole
            );
          } else {
            message.author.createDM().then(dm => {
              dm.send('No user data found.');
            });
          }
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
