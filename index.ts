import { Logging } from '@google-cloud/logging';
import * as Discord from 'discord.js';
import { CredentialBody } from 'google-auth-library';
import { handleBroadcastCommand } from './commands/broadcast';
import { notifyNotLinked } from './commands/common/notifyNotLinked';
import { updateGuildMember } from './commands/common/updateGuildMember';
import { handleElse } from './commands/else';
import { printHelp } from './commands/help';
import { handleMoveVoiceUsersCommand } from './commands/moveVoiceUsers';
import { handleNicknameChange } from './commands/nickname';
import { handleNotLinked } from './commands/notLinked';
import { handleRefreshAllUsers } from './commands/refreshAllUsers';
import { handleRefreshProfile } from './commands/refreshProfile';
import { handleRefreshUser } from './commands/refreshUser';
import { handleVerify } from './commands/verify';
import { getUserData } from './utils/getUserData';

const client = new Discord.Client();

const logging = new Logging({
  projectId: process.env['GOOGLE_CLOUD_PROJECT'],
  credentials: JSON.parse(
    process.env['GOOGLE_APPS_CREDENTIALS'] as string
  ) as CredentialBody
});

const log = logging.log('ivao-th-bot');

client.on('ready', () => {
  console.log('Bot is running');
  const guild = client.guilds.cache.get(
    process.env['IVAOTHAI_GUILD'] as string
  )!;
  const verifiedRole = guild.roles.cache.get(
    process.env['VERIFIED_ROLE'] as string
  )!;
  const thailandDivisionRole = guild.roles.cache.get(
    process.env['THAILAND_DIVISION_ROLE'] as string
  )!;
  const otherDivisionRole = guild.roles.cache.get(
    process.env['OTHER_DIVISION_ROLE'] as string
  )!;
  const thailandDivisionStaffRole = guild.roles.cache.get(
    process.env['THAILAND_DIVISION_STAFF_ROLE'] as string
  )!;
  const otherDivisionStaffRole = guild.roles.cache.get(
    process.env['OTHER_DIVISION_STAFF_ROLE'] as string
  )!;
  const hqStaffRole = guild.roles.cache.get(
    process.env['HQ_STAFF_ROLE'] as string
  )!;
  const unverifiedRole = guild.roles.cache.get(
    process.env['UNVERIFIED_ROLE'] as string
  )!;
  const announcementChannel = guild.channels.cache.get(
    process.env['ANNOUNCEMENT_CHANNEL'] as string
  )! as Discord.TextChannel;
  const entry = log.entry(undefined, 'Bot started');
  void log.write(entry);

  client.on('message', (message) => {
    void (async () => {
      if (message.author.id !== client.user!.id) {
        if (message.content === '!verify') {
          await handleVerify(message, log);
        } else if (message.content.startsWith('!broadcast')) {
          await handleBroadcastCommand(message, announcementChannel);
        } else if (message.content === '!help') {
          await printHelp(message, log);
        } else if (message.content.startsWith('!nickname')) {
          await handleNicknameChange(message, log);
        } else if (message.content.startsWith('!refreshUser')) {
          await handleRefreshUser(
            message,
            client,
            guild,
            verifiedRole,
            thailandDivisionRole,
            otherDivisionRole,
            thailandDivisionStaffRole,
            otherDivisionStaffRole,
            hqStaffRole,
            unverifiedRole
          );
        } else if (message.content === '!notifyNotLinked') {
          await handleNotLinked(message, guild, verifiedRole);
        } else if (message.content === '!refreshAllUsers') {
          await handleRefreshAllUsers(
            message,
            guild,
            verifiedRole,
            thailandDivisionRole,
            otherDivisionRole,
            thailandDivisionStaffRole,
            otherDivisionStaffRole,
            hqStaffRole,
            unverifiedRole
          );
        } else if (message.content === '!refreshProfile') {
          await handleRefreshProfile(client, guild);
        } else if (message.content.startsWith('!moveVoiceUsers')) {
          await handleMoveVoiceUsersCommand(message, guild);
        } else {
          await handleElse(message);
        }
      }
    })();
  });

  client.on('guildMemberUpdate', (oldMember, newMember) => {
    void (async () => {
      if (oldMember.nickname !== newMember.nickname) {
        const userData = await getUserData(newMember.user.id);
        if (userData.status === 'success') {
          await updateGuildMember(
            userData.data,
            newMember,
            verifiedRole,
            thailandDivisionRole,
            otherDivisionRole,
            thailandDivisionRole,
            otherDivisionStaffRole,
            hqStaffRole,
            unverifiedRole
          );
        }
      }
    })();
  });

  client.on('guildMemberAdd', (newMember) => {
    void (async () => {
      const userData = await getUserData(newMember.user.id);
      if (userData.status === 'success') {
        await updateGuildMember(
          userData.data,
          newMember,
          verifiedRole,
          thailandDivisionRole,
          otherDivisionRole,
          thailandDivisionStaffRole,
          otherDivisionStaffRole,
          hqStaffRole,
          unverifiedRole
        );
        if (userData.data.success === false) {
          await newMember.createDM().then((dm) => {
            return notifyNotLinked(dm);
          });
        }
      }
    })();
  });
});

void client.login(process.env['BOT_TOKEN']);

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('Terminating');
  process.exit();
});
