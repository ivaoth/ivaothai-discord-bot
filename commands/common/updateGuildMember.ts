import * as Discord from 'discord.js';

export const updateGuildMember = (
  userData: any,
  guildMember: Discord.GuildMember,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  notifyServerOwner: boolean = false
) => {
  const value = userData;
  let suffix: string;
  let prefix: string;
  if (value.customNickname) {
    suffix = value.customNickname;
  } else {
    suffix = `${value.firstname} ${value.lastname}`;
  }
  if (value.staff) {
    const staff: string = value.staff;
    const validStaff = staff.split(':').filter(s => s.startsWith('TH-') || s.startsWith('VTBB-'));
    if (validStaff.length > 0) {
      prefix = validStaff.join('/');
    } else {
      prefix = value.vid;
    }
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
  console.log(newNickname);
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
};
