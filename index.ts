import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { table } from 'table';
import * as leftPad from 'left-pad';

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

const client = new Discord.Client();
const Logging = require('@google-cloud/logging');

const logging = new Logging({
  credentials: JSON.parse(process.env['GOOGLE_APPS_CREDENTIALS'] as string)
});

const log = logging.log('ivao-th-bot');

let guild: Discord.Guild;
let verifiedRole: Discord.Role;
let thailandDivisionRole: Discord.Role;
let otherDivisionRole: Discord.Role;
let generalChannel: Discord.TextChannel;
let atcOnlineChannel: Discord.TextChannel;

let firstTime = true;
let thailandAtcCallsigns: string[] = [];
let thailandAtcs: any[] = [];

const privkey = JSON.parse(process.env['FIREBASE_CREDENTIALS'] as string);

const debugLogger = (...args: any[]) => {
  if (process.env['DEBUG'] === 'true') {
    console.log(...args);
  }
};

const monthsToString = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
];

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
  atcOnlineChannel = guild.channels.get(process.env[
    'ATC_ONLINE_CHANNEL'
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
    } else {
      handleElse(message, generalChannel);
    }
  }
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
  if (oldMember.nickname !== newMember.nickname) {
    updateGuildMember(
      admin
        .database()
        .ref('users')
        .child(newMember.id.toString()),
      newMember,
      verifiedRole,
      thailandDivisionRole,
      otherDivisionRole
    );
  }
});

client.on('guildMemberAdd', newMember => {
  const userId = newMember.id;
  const userRef = admin
    .database()
    .ref('users')
    .child(userId);
  userRef.once('value', data => {
    if (data.exists()) {
      updateGuildMember(
        userRef,
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
});

admin
  .database()
  .ref('newUsers')
  .on('child_added', _newUser => {
    const newUser = _newUser ? _newUser.val() : null;
    const user = client.fetchUser(newUser);
    user.then(_user => {
      if (guild && guild.available) {
        const _guildMember = guild.fetchMember(_user);
        _guildMember.then(guildMember => {
          updateGuildMember(
            admin
              .database()
              .ref('users')
              .child(newUser),
            guildMember,
            verifiedRole,
            thailandDivisionRole,
            otherDivisionRole,
            true
          ).then(() => {
            if (_newUser) {
              _newUser.ref.remove();
            }
          });
        });
      }
    });
  });

const nameAndVid = (client: any) => {
  if (client.name === client.vid) {
    return client.vid;
  } else {
    return `${client.vid} - ${client.name}`;
  }
};

admin
  .firestore()
  .collection('whazzup')
  .doc('status')
  .onSnapshot(async snap => {
    debugLogger('Data updated');
    const clients: any[] = (await admin
      .firestore()
      .collection('whazzup')
      .doc('clients')
      .collection('clients')
      .where('type', '==', 'atc')
      .where('callsign', '>', 'VT')
      .where('callsign', '<', 'VU')
      .get()).docs.map(d => d.data());
    const newThailandAtcs = clients.filter(
      c => c.type === 'atc' && c.callsign.startsWith('VT')
    );
    const newThailandAtcCallsigns: string[] = newThailandAtcs.map(
      c => c.callsign
    );
    const newlyOnline = newThailandAtcs.filter(
      c => thailandAtcCallsigns.indexOf(c.callsign) === -1
    );
    const newlyOffline = thailandAtcs.filter(
      c => newThailandAtcCallsigns.indexOf(c.callsign) === -1
    );
    debugLogger(thailandAtcCallsigns);
    debugLogger(newThailandAtcCallsigns);
    if (firstTime) {
      debugLogger('This is the first time, skipping');
      firstTime = false;
    } else {
      debugLogger('This is not the first time');
      if (newlyOnline.length > 0 || newlyOffline.length > 0) {
        debugLogger(newlyOnline);
        debugLogger(newlyOffline);
        let outText = '.\n';
        if (newlyOnline.length > 0) {
          outText += '**New ATC online**\n\n';
          for (const atc of newlyOnline) {
            outText += `${atc.callsign} (${nameAndVid(atc)})\n`;
          }
          outText += '\n';
        }
        if (newlyOffline.length > 0) {
          outText += '**ATC gone offline**\n\n';
          for (const atc of newlyOffline) {
            outText += `${atc.callsign} (${nameAndVid(atc)})\n`;
          }
          outText += '\n';
        }
        if (newThailandAtcs.length > 0) {
          const rows = [['Callsign', 'Frequency', 'VID', 'Name', 'Rating']];
          for (const atc of newThailandAtcs) {
            const row: string[] = [];
            row.push(atc.callsign);
            row.push(atc.frequency);
            row.push(atc.vid);
            row.push(atc.name === atc.vid ? '' : atc.name);
            row.push(atc.rating);
            rows.push(row);
          }
          outText += '```\n';
          outText += table(rows);
          outText += '```\n\n';
        }
        const now = new Date();
        outText += `Reported at ${leftPad(now.getUTCDate(), 2, 0)} ${
          monthsToString[now.getUTCMonth()]
        } ${now.getUTCFullYear()} ${leftPad(now.getUTCHours(), 2, 0)}:${leftPad(
          now.getUTCMinutes(),
          2,
          0
        )}:${leftPad(now.getUTCSeconds(), 2, 0)}Z`;
        atcOnlineChannel.send(outText);
      }
    }
    thailandAtcCallsigns = newThailandAtcCallsigns;
    thailandAtcs = newThailandAtcs;
  });

client.login(process.env['BOT_TOKEN']);

process.on('SIGINT', () => {
  console.log('Terminating');
  process.exit();
});
