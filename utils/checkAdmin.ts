import axios from 'axios';

export const isAdmin = async (discord_id: string): Promise<boolean> => {
  const apiBaseUri = process.env['API_BASE_URI'];
  const apiKey = process.env['API_KEY'];
  if (apiBaseUri && apiKey) {
    const url = new URL(`${apiBaseUri}/isAdmin`);
    url.searchParams.set('discord_id', discord_id);
    url.searchParams.set('apiKey', apiKey);
    const result = (await axios.get<{ isAdmin: boolean }>(url.href)).data;
    return result.isAdmin;
  } else {
    return false;
  }
};
