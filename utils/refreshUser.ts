import axios from 'axios';

export const refreshUser = async (discord_id: string): Promise<void> => {
  const apiBaseUri = process.env['API_BASE_URI'];
  const apiKey = process.env['API_KEY'];
  if (apiBaseUri && apiKey) {
    const url = new URL(`${apiBaseUri}/update-member`);
    const body = {
      discord_user_id: discord_id,
      apiKey
    };
    await axios.post(url.href, body);
  }
};

export const refreshAllUsers = async (): Promise<void> => {
  const apiBaseUri = process.env['API_BASE_URI'];
  const apiKey = process.env['API_KEY'];
  if (apiBaseUri && apiKey) {
    const url = new URL(`${apiBaseUri}/update-member/all`);
    const body = {
      apiKey
    };
    await axios.post(url.href, body);
  }
};
