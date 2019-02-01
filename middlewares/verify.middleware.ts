import { Message } from 'discord.js';
import { ReflectiveInjector } from 'injection-js';
import { Backend, backendToken } from '../di/backend';
import { log } from '../utils/log';
import { Middleware, MiddlewareContext } from './middleware';

export class VerifyMiddleware implements Middleware {
  async handle(context: MiddlewareContext) {
    const message = context.message;
    if (message.content.trim().toLowerCase() === '!verify') {
      const logger = context.logger;
      log(
        logger,
        `[verify] received message from ${message.author.username}#${
          message.author.discriminator
        } (${message.author.id})`
      );
      await this.sendVerifyMessage(message, context.injector);
      if (message.channel.type === 'text') {
        await message.delete();
      }
      return true;
    } else {
      return false;
    }
  }

  private async sendVerifyMessage(
    message: Message,
    injector: ReflectiveInjector
  ) {
    const userId = message.author.id;
    const callbackLink = this.getCallbackLink(userId, injector);
    const loginLink = this.getLoginLink(await callbackLink);
    const replyMessage = this.getReplyMessage(loginLink);
    await message.author.createDM().then(dm => {
      dm.send(replyMessage);
    });
  }

  private getReplyMessage(loginLink: URL) {
    const replyTemplate = '[VERIFY_URL]'; // TODO: Fix this
    const replyMessage = replyTemplate.replace('[VERIFY_URL]', loginLink.href);
    return replyMessage;
  }

  private getLoginLink(callbackLink: URL) {
    const loginLink = new URL('https://login.ivao.aero/index.php');
    loginLink.searchParams.set('url', callbackLink.href);
    return loginLink;
  }

  private async getCallbackLink(userId: string, injector: ReflectiveInjector) {
    const token = (injector.get(backendToken) as Backend).getToken(userId);
    const base64Token = Buffer.from(await token, 'utf8').toString('base64');
    const callbackLink = new URL('https://sso.ivaothai.com/discord'); // TODO: refactor this
    callbackLink.searchParams.set('token', base64Token);
    return callbackLink;
  }
}
