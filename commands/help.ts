import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const printHelp = (
  message: Discord.Message,
  generalChannel: Discord.TextChannel,
  log: any
) => {
  message.channel
    .send(
      stripIndents`
    คำสั่งที่สามารถใช้ได้
    \`!verify\`: เชื่อมต่อ VID ของคุณกับ Discord
    \`!nickname <NewNickname>\`: เปลี่ยนชื่อเรียกของคุณใน Discord


    Available commands
    \`!verify\`: Connect your VID to Discord
    \`!nickname <NewNickname>\`: Change your nickname in Discord`
    )
    .then(sentMessage => {
      message.delete({timeout: 5000, reason: 'Timed out!'});
      if (message.channel.id === generalChannel.id) {
        (sentMessage as Discord.Message).delete({timeout: 15000, reason: 'Timed out!'});
      }
    });

  const entry = log.entry(
    null,
    `[help] received message from ${message.author.username}#${
      message.author.discriminator
    } (${message.author.id})`
  );
  log.write(entry);
};
