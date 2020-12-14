import * as Discord from 'discord.js';

export const updateGuildMember = async (
  userData:
    | {
        success: true;
        customNickname: string;
        firstname: string;
        lastname: string;
        staff: string;
        vid: string;
        division: string;
      }
    | { success: false },
  guildMember: Discord.GuildMember,
  verifiedRole: Discord.Role,
  thailandDivisionRole: Discord.Role,
  otherDivisionRole: Discord.Role,
  thailandDivisionStaffRole: Discord.Role,
  otherDivisionStaffRole: Discord.Role,
  hqStaffRole: Discord.Role,
  unverifiedRole: Discord.Role,
  notifyServerOwner = false
): Promise<void> => {
  let suffix: string;
  let prefix: string;
  const roles: Discord.Role[] = [];
  let newNickname = '';
  if (userData.success) {
    if (userData.customNickname) {
      suffix = userData.customNickname;
    } else {
      suffix = `${userData.firstname} ${userData.lastname}`;
    }
    if (userData.staff) {
      const staff: string = userData.staff;
      const positions = staff.split(':');
      const validTHStaff = positions.filter(
        (s) => s.startsWith('TH-') || s.startsWith('VTBB-')
      );
      const validOtherDivisionStaff = positions.filter(
        (s) =>
          !(s.startsWith('TH-') || s.startsWith('VTBB-')) && s.includes('-')
      );
      const validHQStaff = positions.filter((s) => !s.includes('-'));
      if (validTHStaff.length > 0) {
        prefix = validTHStaff.join('/');
        roles.push(thailandDivisionStaffRole);
      } else {
        prefix = userData.vid;
      }
      if (validOtherDivisionStaff.length > 0) {
        roles.push(otherDivisionStaffRole);
      }
      if (validHQStaff.length > 0) {
        roles.push(hqStaffRole);
      }
    } else {
      prefix = userData.vid;
    }
    newNickname = `${prefix} ${suffix}`;
    if (userData.division !== 'TH') {
      newNickname = newNickname.substr(0, 27) + ` - ${userData.division}`;
      roles.push(otherDivisionRole);
    } else {
      roles.push(thailandDivisionRole);
    }
    roles.push(verifiedRole);
  } else {
    roles.push(unverifiedRole);
    newNickname = `[UNVERIFIED] ${guildMember.user.username}`.substr(0, 32);
  }
  await guildMember.roles.set(roles);
  if (newNickname !== guildMember.nickname) {
    try {
      await guildMember.setNickname(newNickname.substr(0, 32));
    } catch {
      if (notifyServerOwner) {
        await guildMember.createDM().then((dm) => {
          return dm.send(
            "Well, I may be at the highest, but I can't compete with the server owner."
          );
        });
      }
    }
  }
  console.log(
    `Updated ${guildMember.user.username}#${guildMember.user.discriminator} (${guildMember.user.id})`
  );
};
