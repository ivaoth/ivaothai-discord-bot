import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const replyToLoginChat = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: any
) => {
  const userId = message.author.id;
  message.author.createDM().then(dm => {
    dm.send(stripIndents`
    คำสังนี้ได้ถูกยกเลิกไปแล้ว โปรดใช้คำสั่ง \`!verify\` แทน

    This command has been deprecated. Use \`!verify\` instead.`);
  });

  if (message.channel.id === generalChannel.id) {
    message.delete(5000);
  }
  const entry = log.entry(
    null,
    `[login] received message from ${message.author.username}#${
      message.author.discriminator
    } (${message.author.id})`
  );
  log.write(entry);
};
