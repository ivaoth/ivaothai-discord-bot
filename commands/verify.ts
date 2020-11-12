import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';
import axios from 'axios';
import { Log } from '@google-cloud/logging';

export const handleVerify = async (
  message: Discord.Message,
  log: Log
): Promise<void> => {
  const dm = message.author.createDM();
  await (await dm).send(stripIndents`
    กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord

    Please click the link below to link your VID with Discord.

    https://l.th.ivao.aero/discord-invite`);

  const entry = log.entry(
    undefined,
    `[verify] received message from ${message.author.username}#${message.author.discriminator} (${message.author.id})`
  );
  await log.write(entry);
};
