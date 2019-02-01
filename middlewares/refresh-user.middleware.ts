import { Middleware, MiddlewareContext } from './middleware';
import { backendToken, Backend } from '../di/backend';
import { refreshGuildMember } from '../utils/refresh-guild-member';

export class RefreshUserMiddleware implements Middleware {
  async handle(context: MiddlewareContext) {
    const message = context.message;
    const messageParts = message.content.trim().split(' ');
    const command = messageParts[0];
    const backend = context.injector.get(backendToken) as Backend;
    if (command.toLowerCase() === '!refreshUser') {
      const userId = messageParts
        .slice(1)
        .join(' ')
        .trim();
      if (backend.isAdmin(message.author.id)) {
        refreshGuildMember(userId, context.injector, context.client);
      } else {
        await message.reply('This command is for administrators only.');
      }
      return true;
    } else {
      return false;
    }
  }
}
