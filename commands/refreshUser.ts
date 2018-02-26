import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { updateGuildMember } from './common/updateGuildMember';

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
    .once('value', v => {
      if (v.exists()) {
        const userId = message.content.slice(12).trim();
        client.fetchUser(userId).then(
          user => {
            guild.fetchMember(user).then(
              member => {
                const userRef = admin
                  .database()
                  .ref('users')
                  .child(userId);
                userRef.once('value', data => {
                  if (data.exists()) {
                    updateGuildMember(
                      userRef,
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
                });
              },
              err => {
                message.author.createDM().then(dm => {
                  dm.send('This user is not member of this guild.');
                });
              }
            );
          },
          err => {
            message.author.createDM().then(dm => {
              dm.send(`No user with id ${userId}`);
            });
          }
        );
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
