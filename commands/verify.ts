import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const handleVerify = async (message: Discord.OmitPartialGroupDMChannel<Discord.Message>): Promise<void> => {
  const dm = message.author.createDM();
  await (
    await dm
  ).send(stripIndents`
    กรุณาคลิกที่ link ด้านล่างนี้ เพื่อเชื่อมต่อ IVAO Account ของคุณ กับ Discord

    Please click the link below to link your VID with Discord.

    https://l.th.ivao.aero/discordInvite`);
};
