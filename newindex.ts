import { Logging } from '@google-cloud/logging';
import * as Discord from 'discord.js';
import * as admin from 'firebase-admin';
import { ReflectiveInjector } from 'injection-js';
import { backendToken } from './di/backend';
import { BackendFirebaseImpl } from './di/backend-firebase-impl';
import { configToken } from './di/config';
import { BroadcastMiddleware } from './middlewares/broadcast.middleware';
import { Middleware, MiddlewareContext } from './middlewares/middleware';
import { NicknameMiddleware } from './middlewares/nickname.middleware';
import { RefreshUserMiddleware } from './middlewares/refresh-user.middleware';
import { VerifyMiddleware } from './middlewares/verify.middleware';
import { log as writeLog } from './utils/log';

const client = new Discord.Client();

const logging = new Logging({
  projectId: process.env['GOOGLE_CLOUD_PROJECT'],
  credentials: JSON.parse(process.env['GOOGLE_APPS_CREDENTIALS'] as string)
});

const log = logging.log('ivao-bot');

const privkey = JSON.parse(process.env['FIREBASE_CREDENTIALS'] as string);

//----- CONFIGURATION TOKENS -----

const guildId = process.env['IVAOTHAI_GUILD'] as string;
const verifiedRoleId = process.env['VERIFIED_ROLE'] as string;
const thisDivisionRoleId = process.env['THAILAND_DIVISION_ROLE'] as string;
const otherDivisionRoleId = process.env['OTHER_DIVISION_ROLE'] as string;
const broadcastChannelId = process.env['BROADCAST_CHANNEL'] as string;
const division = process.env['DIVISION'] as string;

//----- CONFIGURATION TOKENS -----

const injector = ReflectiveInjector.resolveAndCreate([
  {
    provide: backendToken,
    useClass: BackendFirebaseImpl
  },
  {
    provide: configToken,
    useValue: {
      guildId,
      verifiedRoleId,
      thisDivisionRoleId,
      otherDivisionRoleId,
      broadcastChannelId,
      division
    }
  }
]);

admin.initializeApp({
  credential: admin.credential.cert(privkey),
  databaseURL: 'https://ivao-thailand-sso.firebaseio.com'
});

client.on('ready', () => {
  writeLog(log, `Bot is started at ${+new Date()}`);
});

client.on('message', async message => {
  if (message.author.id !== client.user.id) {
    if (message.content === '!help') {
      // printHelp(message, generalChannel, log);
    } else if (message.content === '!notifyNotLinked') {
      // handleNotLinked(message, guild, verifiedRole);
    } else if (message.content === '!refreshAllUsers') {
      // handleRefreshAllUsers(
      //   message,
      //   client,
      //   guild,
      //   verifiedRole,
      //   thailandDivisionRole,
      //   otherDivisionRole
      // );
    } else if (message.content === '!refreshProfile') {
      // handleRefreshProfile(client, guild);
    } else if (message.content.startsWith('!moveVoiceUsers')) {
      // handleMoveVoiceUsersCommand(message, guild);
    } else {
      // handleElse(message, generalChannel);
    }
  }
  const middlewares: Middleware[] = [
    new VerifyMiddleware(),
    new BroadcastMiddleware(),
    new NicknameMiddleware(),
    new RefreshUserMiddleware()
  ];
  const context: MiddlewareContext = {
    message,
    logger: log,
    client,
    middlewares,
    injector
  };
  writeLog(
    log,
    `[message] message content ${message.content} from ${
      message.author.id
    } via ${message.channel.id}`
  );
  loop: for (const middleware of middlewares) {
    try {
      const result = middleware.handle(context);
      if (await result) {
        break loop;
      }
    } catch (e) {
      writeLog(
        log,
        `[error] error caught by message content ${message.content} from ${
          message.author.id
        } via ${message.channel.id}`
      );
      break loop;
    }
  }
});

client.login(process.env['BOT_TOKEN']);

process.on('SIGINT', () => {
  writeLog(log, `Bot is terminated at ${+new Date()}`);
  process.exit();
});
