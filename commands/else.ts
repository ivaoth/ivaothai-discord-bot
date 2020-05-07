import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const handleElse = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel
): void => {
  if (message.channel.id !== generalChannel.id) {
    message.channel.send(stripIndents`
    พิมพ์ \`!help\` เพื่อแสดงคำสั่งที่ใช้ได้
    Type \`!help\` to show available commands.`);
  }
};
