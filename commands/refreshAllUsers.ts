import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { updateGuildMember } from './common/updateGuildMember';

export const handleRefreshAllUsers = (
  message: Discord.Message,
  client: Discord.Client,
  guild: Discord.Guild,
  verifiedRole: Discord.Role
) => {
  const authorId = message.author.id;
  admin
    .database()
    .ref('admins')
    .child(authorId.toString())
    .once('value', v => {
      if (v.exists()) {
        const usersRef = admin.database().ref('users');
        usersRef.on('child_added', data => {
          if (data!.exists()) {
            const userId = data!.key!;
            client.fetchUser(userId).then(
              user => {
                guild.fetchMember(user).then(
                  member => {
                    updateGuildMember(
                      admin
                        .database()
                        .ref('users')
                        .child(data!.key!),
                      member,
                      verifiedRole
                    );
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
            message.author.createDM().then(dm => {
              dm.send('No user data found.');
            });
          }
        });
      } else {
        message.channel.send(
          'You are not in the list of admins, please do not try this command.'
        );
      }
    });
};
