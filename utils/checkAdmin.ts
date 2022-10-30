import axios from 'axios';

export const isAdmin = async (discord_id: string): Promise<boolean> => {
  const url = new URL(`${process.env['API_BASE_URI']!}/isAdmin`);
  url.searchParams.set('discord_id', discord_id);
  url.searchParams.set('apiKey', process.env['API_KEY']!);
  const result = (await axios.get<{ isAdmin: boolean }>(url.href)).data;
  return result.isAdmin;
};
