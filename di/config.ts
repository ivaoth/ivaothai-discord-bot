import { InjectionToken } from "injection-js";

export const configToken = new InjectionToken<Config>('configToken');

export interface Config {
  guildId: string;
  verifiedRoleId: string;
  thisDivisionRoleId: string;
  otherDivisionRoleId: string;
  broadcastChannelId: string;
  division: string;
}
