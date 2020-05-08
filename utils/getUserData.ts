import axios from 'axios';

export const getUserData = async (
  discord_id: string
): Promise<
  | {
      success: true;
      customNickname: string;
      firstname: string;
      lastname: string;
      staff: string;
      vid: string;
      division: string;
    }
  | { success: false }
> => {
  const getUserDataUrl = new URL('https://sso.th.ivao.aero/getUser');
  getUserDataUrl.searchParams.set('discord_id', discord_id);
  getUserDataUrl.searchParams.set('apiKey', process.env['API_KEY']!);
  return (
    await axios.get<
      | {
          success: true;
          customNickname: string;
          firstname: string;
          lastname: string;
          staff: string;
          vid: string;
          division: string;
        }
      | { success: false }
    >(getUserDataUrl.href)
  ).data;
};
