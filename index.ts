import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import axios from 'axios';

import { handleBroadcastCommand } from './commands/broadcast';
import { notifyNotLinked } from './commands/common/notifyNotLinked';
import { updateGuildMember } from './commands/common/updateGuildMember';
import { handleElse } from './commands/else';
import { printHelp } from './commands/help';
import { replyToLoginChat } from './commands/login';
import { handleNicknameChange } from './commands/nickname';
import { handleNotLinked } from './commands/notLinked';
import { handleRefreshUser } from './commands/refreshUser';
import { handleVerify } from './commands/verify';
import { handleRefreshAllUsers } from './commands/refreshAllUsers';
import { handleRefreshProfile } from './commands/refreshProfile';
import { handleMoveVoiceUsersCommand } from './commands/moveVoiceUsers';
const { Logging } = require('@google-cloud/logging');

const client = new Discord.Client();

const logging = new Logging({
  projectId: process.env['GOOGLE_CLOUD_PROJECT'],
  credentials: JSON.parse(process.env['GOOGLE_APPS_CREDENTIALS'] as string)
});

const log = logging.log('ivao-th-bot');

let guild: Discord.Guild;
let verifiedRole: Discord.Role;
let thailandDivisionRole: Discord.Role;
let otherDivisionRole: Discord.Role;
let generalChannel: Discord.TextChannel;

const privkey = JSON.parse(process.env['FIREBASE_CREDENTIALS'] as string);

admin.initializeApp({
  credential: admin.credential.cert(privkey),
  databaseURL: 'https://ivao-thailand-sso.firebaseio.com'
});

client.on('ready', () => {
  console.log('Bot is running');
  guild = client.guilds.get(process.env['IVAOTHAI_GUILD'] as string)!;
  verifiedRole = guild.roles.get(process.env['VERIFIED_ROLE'] as string)!;
  thailandDivisionRole = guild.roles.get(process.env[
    'THAILAND_DIVISION_ROLE'
  ] as string)!;
  otherDivisionRole = guild.roles.get(process.env[
    'OTHER_DIVISION_ROLE'
  ] as string)!;
  generalChannel = guild.channels.get(process.env[
    'GENERAL_CHANNEL'
  ] as string)! as Discord.TextChannel;
  const entry = log.entry(null, 'Bot started');
  log.write(entry);
});

client.on('message', message => {
  if (message.author.id !== client.user.id) {
    if (message.content === '!login') {
      replyToLoginChat(message, generalChannel, log);
    } else if (message.content === '!verify') {
      handleVerify(message, generalChannel, log);
    } else if (message.content.startsWith('!broadcast')) {
      handleBroadcastCommand(message, generalChannel);
    } else if (message.content === '!help') {
      printHelp(message, generalChannel, log);
    } else if (message.content.startsWith('!nickname')) {
      handleNicknameChange(message, generalChannel, log);
    } else if (message.content.startsWith('!refreshUser')) {
      handleRefreshUser(
        message,
        client,
        guild,
        verifiedRole,
        thailandDivisionRole,
        otherDivisionRole
      );
    } else if (message.content === '!notifyNotLinked') {
      handleNotLinked(message, guild, verifiedRole);
    } else if (message.content === '!refreshAllUsers') {
      handleRefreshAllUsers(
        message,
        client,
        guild,
        verifiedRole,
        thailandDivisionRole,
        otherDivisionRole
      );
    } else if (message.content === '!refreshProfile') {
      handleRefreshProfile(client, guild);
    } else if (message.content.startsWith('!moveVoiceUsers')) {
      handleMoveVoiceUsersCommand(message, guild);
    } else {
      handleElse(message, generalChannel);
    }
  }
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
  if (oldMember.nickname !== newMember.nickname) {
    const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
    getUserDataUrl.searchParams.set('discord_id', newMember.user.id);
    const userData = (await axios.get(getUserDataUrl.href)).data;
    if (userData.success) {
      updateGuildMember(
        userData,
        newMember,
        verifiedRole,
        thailandDivisionRole,
        otherDivisionRole
      );
    }
  }
});

client.on('guildMemberAdd', async newMember => {
  const userId = newMember.id;
  const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
  getUserDataUrl.searchParams.set('discord_id', newMember.user.id);
  const userData = (await axios.get(getUserDataUrl.href)).data;
  if (userData.success) {
    updateGuildMember(
      userData,
      newMember,
      verifiedRole,
      thailandDivisionRole,
      otherDivisionRole
    );
  } else {
    newMember.createDM().then(dm => {
      notifyNotLinked(dm);
    });
  }
});

client.login(process.env['BOT_TOKEN']);

process.on('SIGINT', () => {
  console.log('Terminating');
  process.exit();
});
