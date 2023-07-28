import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const printHelp = async (
  message: Discord.Message
): Promise<void> => {
  await message.channel.send(
    stripIndents`
    คำสั่งที่สามารถใช้ได้
    \`!verify\`: เชื่อมต่อ VID ของคุณกับ Discord
    \`!nickname <NewNickname>\`: เปลี่ยนชื่อเรียกของคุณใน Discord


    Available commands
    \`!verify\`: Connect your VID to Discord
    \`!nickname <NewNickname>\`: Change your nickname in Discord`
  );
};
