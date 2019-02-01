import * as Discord from 'discord.js';
import { Log } from '@google-cloud/logging';
import { ReflectiveInjector } from 'injection-js';

export interface Middleware {
  handle: (context: MiddlewareContext) => Promise<boolean>;
}

export interface MiddlewareContext {
  message: Discord.Message;
  logger: Log;
  client: Discord.Client;
  middlewares: Middleware[];
  injector: ReflectiveInjector;
}
