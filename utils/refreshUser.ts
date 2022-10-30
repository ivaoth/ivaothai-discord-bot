import axios from 'axios';

export const refreshUser = async (discord_id: string): Promise<void> => {
  const url = new URL(`${process.env['API_BASE_URI']!}/update-member`);
  const body = {
    discord_user_id: discord_id,
    apiKey: process.env['API_KEY']
  };
  await axios.post<void>(url.href, body);
};

export const refreshAllUsers = async (): Promise<void> => {
  const url = new URL(`${process.env['API_BASE_URI']!}/update-member/all`);
  const body = {
    apiKey: process.env['API_KEY']
  };
  await axios.post<void>(url.href, body);
};
