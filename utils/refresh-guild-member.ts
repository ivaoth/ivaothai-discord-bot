import { ReflectiveInjector } from 'injection-js';
import { backendToken, Backend } from '../di/backend';
import { Client, GuildMember, Guild, Role } from 'discord.js';
import { configToken, Config } from '../di/config';

export const refreshGuildMember = async (
  userId: string,
  injector: ReflectiveInjector,
  client: Client
) => {
  const backend = injector.get(backendToken) as Backend;
  const config = injector.get(configToken) as Config;
  const userData = backend.getUserData<{
    firstname: string;
    lastname: string;
    staff: string;
    vid: string;
    customNickname?: string;
    division: string;
  }>(userId);
  const nickname = await getNickname(userData, config);
  const guild = getGuild(client, config.guildId);
  const guildMember = getGuildMember(guild, userId)!;
  await guildMember.setNickname(nickname);
  await setGuildMemberRoles(guildMember, userData, config, guild);
};

const getNickname = async (
  userData: Promise<{
    firstname: string;
    lastname: string;
    staff: string;
    vid: string;
    customNickname?: string;
    division: string;
  }>,
  config: Config
) => {
  const prefix = (await userData).staff
    ? (await userData).staff
    : (await userData).vid;
  const name = (await userData).customNickname
    ? (await userData).customNickname
    : `${(await userData).firstname} ${(await userData).lastname}`;
  const suffix =
    (await userData).division === config.division
      ? ''
      : ` - ${(await userData).division}`;
  const nicknameWithoutDivision = `${prefix} ${name}`.substr(
    0,
    32 - suffix.length
  );
  const nickname = nicknameWithoutDivision + suffix;
  return nickname;
};

const getGuild = (client: Client, guildId: string) => {
  return client.guilds.get(guildId)!;
};

const getGuildMember = (guild: Guild, userId: string) => {
  return guild.members.get(userId);
};

const setGuildMemberRoles = async (
  guildMember: GuildMember,
  userData: Promise<{
    firstname: string;
    lastname: string;
    staff: string;
    vid: string;
    customNickname?: string;
    division: string;
  }>,
  config: Config,
  guild: Guild
) => {
  const thisDivisionRole = guild.roles.get(config.thisDivisionRoleId)!;
  const otherDivisionRole = guild.roles.get(config.otherDivisionRoleId)!;
  const verifiedRole = guild.roles.get(config.verifiedRoleId)!;
  const rolesToBeAdded: Role[] = [verifiedRole];
  if ((await userData).division === config.division) {
    rolesToBeAdded.push(thisDivisionRole);
  } else {
    rolesToBeAdded.push(otherDivisionRole);
  }
  await guildMember.addRoles(rolesToBeAdded);
};
