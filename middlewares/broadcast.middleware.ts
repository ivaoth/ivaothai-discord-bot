import { TextChannel } from 'discord.js';
import { Backend, backendToken } from '../di/backend';
import { Middleware, MiddlewareContext } from './middleware';
import { configToken, Config } from '../di/config';

export class BroadcastMiddleware implements Middleware {
  async handle(context: MiddlewareContext) {
    const message = context.message;
    if (message.content.startsWith('!broadcast')) {
      const authorId = message.author.id;
      const broadcastChannel = this.getBroadcastChannel(context);
      const isAdmin = (context.injector.get(backendToken) as Backend).isAdmin(
        authorId
      );
      if (await isAdmin) {
        (broadcastChannel as TextChannel).send(
          `@everyone\n${message.content
            .split('\n')
            .slice(1)
            .join('\n')}`
        );
      } else {
        message.channel.send('This command is for administrators only.');
      }
      return true;
    } else {
      return false;
    }
  }

  private getBroadcastChannel(context: MiddlewareContext) {
    const broadcastChannelId = (context.injector.get(configToken) as Config)
      .broadcastChannelId;
    const guildId = (context.injector.get(configToken) as Config).guildId;
    const guild = context.client.guilds.get(guildId)!;
    const broadcastChannel = guild.channels.get(broadcastChannelId)!;
    return broadcastChannel;
  }
}
