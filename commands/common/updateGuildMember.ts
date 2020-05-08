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
        await guildMember.roles.add(thailandDivisionStaffRole);
      } else {
        prefix = userData.vid;
        await guildMember.roles.remove(thailandDivisionStaffRole);
      }
      if (validOtherDivisionStaff.length > 0) {
        await guildMember.roles.add(otherDivisionStaffRole);
      } else {
        await guildMember.roles.remove(otherDivisionStaffRole);
      }
      if (validHQStaff.length > 0) {
        await guildMember.roles.add(hqStaffRole);
      } else {
        await guildMember.roles.remove(hqStaffRole);
      }
    } else {
      prefix = userData.vid;
      await guildMember.roles.remove(thailandDivisionStaffRole);
      await guildMember.roles.remove(otherDivisionStaffRole);
      await guildMember.roles.remove(hqStaffRole);
    }
    let newNickname = `${prefix} ${suffix}`;
    if (userData.division !== 'TH') {
      newNickname = newNickname.substr(0, 27) + ` - ${userData.division}`;
      await guildMember.roles.add(otherDivisionRole);
      await guildMember.roles.remove(thailandDivisionRole);
    } else {
      await guildMember.roles.add(thailandDivisionRole);
      await guildMember.roles.remove(otherDivisionRole);
    }
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
    await guildMember.roles.remove(unverifiedRole);
    await guildMember.roles.add(verifiedRole);
  } else {
    await guildMember.roles.remove(verifiedRole);
    await guildMember.roles.remove(thailandDivisionRole);
    await guildMember.roles.remove(otherDivisionRole);
    await guildMember.roles.remove(thailandDivisionStaffRole);
    await guildMember.roles.remove(otherDivisionStaffRole);
    await guildMember.roles.remove(hqStaffRole);
    await guildMember.roles.add(unverifiedRole);
    const nickname = `[UNVERIFIED] ${guildMember.user.username}`.substr(0, 32);
    if (nickname !== guildMember.nickname) {
      await guildMember.setNickname(nickname);
    }
  }
  console.log(
    `Updated ${guildMember.user.username}#${guildMember.user.discriminator}`
  );
};
