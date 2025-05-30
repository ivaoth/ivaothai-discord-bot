import * as Discord from 'discord.js';
import { handleBroadcastCommand } from './commands/broadcast';
import { handleElse } from './commands/else';
import { printHelp } from './commands/help';
import { handleMoveVoiceUsersCommand } from './commands/moveVoiceUsers';
import { handleNicknameChange } from './commands/nickname';
import { handleNotLinked } from './commands/notLinked';
import { handleRefreshAllUsers } from './commands/refreshAllUsers';
import { handleRefreshProfile } from './commands/refreshProfile';
import { handleRefreshUser } from './commands/refreshUser';
import { handleVerify } from './commands/verify';
import { refreshUser } from './utils/refreshUser';

const client = new Discord.Client({
  intents:
    Discord.GatewayIntentBits.GuildMembers |
    Discord.GatewayIntentBits.GuildMessages |
    Discord.GatewayIntentBits.DirectMessages |
    Discord.GatewayIntentBits.Guilds,
  partials: [Discord.Partials.Channel]
});

client.on('ready', () => {
  console.log('Bot is running');
  const guild = client.guilds.cache.get(process.env['IVAOTHAI_GUILD'] as string);
  if (guild) {
    const verifiedRole = guild.roles.cache.get(process.env['VERIFIED_ROLE'] as string);
    const announcementChannel = guild.channels.cache.get(process.env['ANNOUNCEMENT_CHANNEL'] as string);
    client.on('messageCreate', (message) => {
      void (async () => {
        if (client.user && message.author.id !== client.user.id) {
          if (message.content === '!verify') {
            await handleVerify(message);
          } else if (message.content.startsWith('!broadcast')) {
            await handleBroadcastCommand(message, announcementChannel);
          } else if (message.content === '!help') {
            await printHelp(message);
          } else if (message.content.startsWith('!nickname')) {
            await handleNicknameChange(message);
          } else if (message.content.startsWith('!refreshUser')) {
            await handleRefreshUser(message);
          } else if (message.content === '!notifyNotLinked') {
            await handleNotLinked(message, guild, verifiedRole);
          } else if (message.content === '!refreshAllUsers') {
            await handleRefreshAllUsers(message);
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
          await refreshUser(newMember.user.id);
        }
      })();
    });

    client.on('guildMemberAdd', (newMember) => {
      void (async () => {
        await refreshUser(newMember.user.id);
      })();
    });
  }
});

void client.login(process.env['BOT_TOKEN']);

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('Terminating');
  process.exit();
});
