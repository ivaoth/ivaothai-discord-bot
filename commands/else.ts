import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const handleElse = async (message: Discord.Message): Promise<void> => {
  await message.channel.send(stripIndents`
    พิมพ์ \`!help\` เพื่อแสดงคำสั่งที่ใช้ได้
    Type \`!help\` to show available commands.`);
};
