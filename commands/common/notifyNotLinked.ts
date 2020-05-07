import * as Discord from 'discord.js';
import { stripIndents } from 'common-tags';

export const notifyNotLinked = (dm: Discord.DMChannel): void => {
  dm.send(stripIndents`
              สวัสดี ฉันเป็นบอทของ IVAO Thailand Division
              ดูเหมือนว่าคุณจะยังไม่ได้เชื่อมต่อ IVAO Account ของคุณกับ Discord แห่งนี้
              เพื่อให้สมาชิกคนอื่นรู้จักคุณ คุณควรเชื่อมต่อ IVAO Account ของคุณกับ Discord แห่งนี้

              หากคุณมี IVAO Account แล้ว กรุณาพิมพ์ \`!verify\` ผ่านทาง direct message มาหาฉัน แล้วคลิก link ที่ฉันส่งให้คุณ

              หากคุณยังไม่มี IVAO Account ฉันแนะนำให้คุณสมัครสมาชิก IVAO ที่ https://ivao.aero

              Hello! I'm a bot of IVAO Thailand Division.
              It looks like that you haven't linked your IVAO Account to this Discord server yet.
              To ensure that everybody in the server recognise you, you should link your IVAO Account to this Discord server.

              If you've already got an IVAO Account, simply message me \`!verify\` and I'll send you an instruction to link you IVAO Account to this server.

              If you haven't got an IVAO Account yet, I recommend you to register at https://ivao.aero.`);
};
