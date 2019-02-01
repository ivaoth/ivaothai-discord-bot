import { Backend, backendToken } from '../di/backend';
import { refreshGuildMember } from '../utils/refresh-guild-member';
import { Middleware, MiddlewareContext } from './middleware';

export class NicknameMiddleware implements Middleware {
  async handle(context: MiddlewareContext) {
    const message = context.message;
    const messageParts = message.content.trim().split(' ');
    const command = messageParts[0];
    const nickname = messageParts
      .slice(1)
      .join(' ')
      .trim();
    const injector = context.injector;
    if (command.toLowerCase() === '!nickname') {
      const userId = message.author.id;
      await (injector.get(backendToken) as Backend).saveNickname(
        userId,
        nickname
      );
      await refreshGuildMember(userId, injector, context.client);
      if (message.channel.type === 'text') {
        await message.delete();
      }
      return true;
    } else {
      return false;
    }
  }
}
