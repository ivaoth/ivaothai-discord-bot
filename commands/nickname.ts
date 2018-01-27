import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { stripIndents } from 'common-tags';

export const handleNicknameChange = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: any
) => {
  admin
    .database()
    .ref('users')
    .child(message.author.id.toString())
    .once('value', user => {
      if (user.exists()) {
        const newNickname = message.content.slice(9).trim();
        admin
          .database()
          .ref('users')
          .child(message.author.id.toString())
          .child('customNickname')
          .set(newNickname)
          .then(() => {
            const entry = log.entry(
              null,
              `[nickname] change nickname of ${message.author.username}#${
                message.author.discriminator
              } (${message.author.id}) to ${newNickname}`
            );
            log.write(entry);
            admin
              .database()
              .ref('newUsers')
              .push(message.author.id.toString())
              .then(() => {
                message.author.createDM().then(dm => {
                  dm.send('Nickname changed!');
                });
              });
          });
        if (message.channel.id === generalChannel.id) {
          message.delete(5000);
        }
      } else {
        message.author.createDM().then(dm => {
          dm.send(stripIndents`
          คุณยังไม่ได้เชื่อมต่อ IVAO Account ของคุณ
          กรุณาใช้คำสั่ง \`!verify\` เพื่อเชื่อมต่อ

          You have not linked your IVAO Account yet.
          Please use the command \`!verify\` to link your IVAO Account.'`);
        });
      }
    });
};
