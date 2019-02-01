import { Log } from '@google-cloud/logging';

export const log = (l: Log, message: string) => {
  const entry = l.entry(null, message);
  l.write(entry);
}
