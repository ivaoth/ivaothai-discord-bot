import * as Discord from 'discord.js';

export const updateGuildMember = (
  userData: {
    customNickname: string;
    firstname: string;
    lastname: string;
    staff: string;
    vid: string;
    division: string;
  },
  guildMember: Discord.GuildMember,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  thailandDivisionStaffRole: Discord.Role,
  otherDivisionStaffRole: Discord.Role,
  hqStaffRole: Discord.Role,
  notifyServerOwner = false
): void => {
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
    const positions = staff.split(':');
    const validTHStaff = positions.filter(
      (s) => s.startsWith('TH-') || s.startsWith('VTBB-')
    );
    const validOtherDivisionStaff = positions.filter(
      (s) => !(s.startsWith('TH-') || s.startsWith('VTBB-')) && s.includes('-')
    );
    const validHQStaff = positions.filter((s) => !s.includes('-'));
    if (validTHStaff.length > 0) {
      guildMember.roles.add(thailandDivisionStaffRole);
    } else {
      prefix = value.vid;
      guildMember.roles.remove(thailandDivisionStaffRole);
    }
    if (validOtherDivisionStaff.length > 0) {
      guildMember.roles.add(otherDivisionStaffRole);
    } else {
      guildMember.roles.remove(otherDivisionStaffRole);
    }
    if (validHQStaff.length > 0) {
      guildMember.roles.add(hqStaffRole);
    } else {
      guildMember.roles.remove(hqStaffRole);
    }
    prefix = positions.join('/');
  } else {
    prefix = value.vid;
    guildMember.roles.remove(thailandDivisionStaffRole);
    guildMember.roles.remove(otherDivisionStaffRole);
    guildMember.roles.remove(hqStaffRole);
  }
  let newNickname = `${prefix} ${suffix}`;
  if (value.division !== 'TH') {
    newNickname = newNickname.substr(0, 27) + ` - ${value.division}`;
    guildMember.roles.add(otherDivisionRole);
    guildMember.roles.remove(thailandDivisionRole);
  } else {
    guildMember.roles.add(thailandDivisionRole);
    guildMember.roles.remove(otherDivisionRole);
  }
  console.log(newNickname);
  if (newNickname !== guildMember.nickname) {
    guildMember.setNickname(newNickname.substr(0, 32)).catch(() => {
      if (notifyServerOwner) {
        guildMember.createDM().then((dm) => {
          dm.send(
            "Well, I may be at the highest, but I can't compete with the server owner."
          );
        });
      }
    });
  }
  guildMember.roles.add(verifiedRole);
};
