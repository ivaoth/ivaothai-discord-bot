import { Middleware, MiddlewareContext } from './middleware';
import { backendToken, Backend } from '../di/backend';
import { configToken, Config } from '../di/config';

export class RefreshAllUsersMiddleware implements Middleware {
  async handle(context: MiddlewareContext) {
    const message = context.message;
    if (message.content.trim().toLowerCase() === '!refreshAllUsers') {
      const backend = context.injector.get(backendToken) as Backend;
      if (await backend.isAdmin(message.author.id)) {
        const config = context.injector.get(configToken) as Config;
        const guildId = config.guildId;
        const client = context.client;
        const guild = client.guilds.get(guildId);
      } else {
        await message.reply('This command is for administrators only.');
      }
      return true;
    } else {
      return false;
    }
  }
}
