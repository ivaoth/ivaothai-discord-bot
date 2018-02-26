import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';

export const updateGuildMember = (
  userDataRef: admin.database.Reference,
  guildMember: Discord.GuildMember,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  notifyServerOwner: boolean = false
) => {
  return new Promise((resolve, reject) => {
    userDataRef.once('value', userData => {
      if (userData.exists()) {
        const value = userData.val();
        let suffix: string;
        let prefix: string;
        if (value.customNickname) {
          suffix = value.customNickname;
        } else {
          suffix = `${value.firstname} ${value.lastname}`;
        }
        if (value.staff) {
          prefix = value.staff;
        } else {
          prefix = value.vid;
        }
        let newNickname = `${prefix} ${suffix}`;
        if (value.division !== 'TH') {
          newNickname = newNickname.substr(0, 27) + ` - ${value.division}`;
          guildMember.addRole(otherDivisionRole);
        } else {
          guildMember.addRole(thailandDivisionRole);
        }
        if (newNickname !== guildMember.nickname) {
          guildMember.setNickname(newNickname.substr(0, 32)).catch(() => {
            if (notifyServerOwner) {
              guildMember.createDM().then(dm => {
                dm.send(
                  "Well, I may be at the highest, but I can't compete with the server owner."
                );
              });
            }
          });
        }
        guildMember.addRole(verifiedRole);
        resolve();
      } else {
        resolve();
      }
    });
  });
};
