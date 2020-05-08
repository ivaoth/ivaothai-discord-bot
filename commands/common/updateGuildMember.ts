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
  botRole: Discord.Role,
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
        guildMember.roles.cache.some(
          (r) => r.id === thailandDivisionStaffRole.id
        ) || (await guildMember.roles.add(thailandDivisionStaffRole));
      } else {
        prefix = userData.vid;
        guildMember.roles.cache.some(
          (r) => r.id === thailandDivisionStaffRole.id
        ) && (await guildMember.roles.remove(thailandDivisionStaffRole));
      }
      if (validOtherDivisionStaff.length > 0) {
        guildMember.roles.cache.some(
          (r) => r.id === otherDivisionStaffRole.id
        ) || (await guildMember.roles.add(otherDivisionStaffRole));
      } else {
        guildMember.roles.cache.some(
          (r) => r.id === otherDivisionStaffRole.id
        ) && (await guildMember.roles.remove(otherDivisionStaffRole));
      }
      if (validHQStaff.length > 0) {
        guildMember.roles.cache.some((r) => r.id === hqStaffRole.id) ||
          (await guildMember.roles.add(hqStaffRole));
      } else {
        guildMember.roles.cache.some((r) => r.id === hqStaffRole.id) &&
          (await guildMember.roles.remove(hqStaffRole));
      }
    } else {
      prefix = userData.vid;
      guildMember.roles.cache.some(
        (r) => r.id === thailandDivisionStaffRole.id
      ) && (await guildMember.roles.remove(thailandDivisionStaffRole));
      guildMember.roles.cache.some((r) => r.id === otherDivisionStaffRole.id) &&
        (await guildMember.roles.remove(otherDivisionStaffRole));
      guildMember.roles.cache.some((r) => r.id === hqStaffRole.id) &&
        (await guildMember.roles.remove(hqStaffRole));
    }
    let newNickname = `${prefix} ${suffix}`;
    if (userData.division !== 'TH') {
      newNickname = newNickname.substr(0, 27) + ` - ${userData.division}`;
      guildMember.roles.cache.some((r) => r.id === otherDivisionRole.id) ||
        (await guildMember.roles.add(otherDivisionRole));
      guildMember.roles.cache.some((r) => r.id === thailandDivisionRole.id) &&
        (await guildMember.roles.remove(thailandDivisionRole));
    } else {
      guildMember.roles.cache.some((r) => r.id === thailandDivisionRole.id) ||
        (await guildMember.roles.add(thailandDivisionRole));
      guildMember.roles.cache.some((r) => r.id === otherDivisionRole.id) &&
        (await guildMember.roles.remove(otherDivisionRole));
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
    guildMember.roles.cache.some((r) => r.id === unverifiedRole.id) &&
      (await guildMember.roles.remove(unverifiedRole));
    guildMember.roles.cache.some((r) => r.id === verifiedRole.id) ||
      (await guildMember.roles.add(verifiedRole));
  } else {
    if (!guildMember.roles.cache.some((r) => r.id === botRole.id)) {
      guildMember.roles.cache.some((r) => r.id === verifiedRole.id) &&
        (await guildMember.roles.remove(verifiedRole));
      guildMember.roles.cache.some((r) => r.id === thailandDivisionRole.id) &&
        (await guildMember.roles.remove(thailandDivisionRole));
      guildMember.roles.cache.some((r) => r.id === otherDivisionRole.id) &&
        (await guildMember.roles.remove(otherDivisionRole));
      guildMember.roles.cache.some(
        (r) => r.id === thailandDivisionStaffRole.id
      ) && (await guildMember.roles.remove(thailandDivisionStaffRole));
      guildMember.roles.cache.some((r) => r.id === otherDivisionStaffRole.id) &&
        (await guildMember.roles.remove(otherDivisionStaffRole));
      guildMember.roles.cache.some((r) => r.id === hqStaffRole.id) &&
        (await guildMember.roles.remove(hqStaffRole));
      guildMember.roles.cache.some((r) => r.id === unverifiedRole.id) ||
        (await guildMember.roles.add(unverifiedRole));
      const nickname = `[UNVERIFIED] ${guildMember.user.username}`.substr(
        0,
        32
      );
      if (nickname !== guildMember.nickname) {
        await guildMember.setNickname(nickname);
      }
    }
  }
  console.log(
    `Updated ${guildMember.user.username}#${guildMember.user.discriminator} (${guildMember.user.id})`
  );
};
