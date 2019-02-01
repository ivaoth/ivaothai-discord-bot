import { InjectionToken } from 'injection-js';

export interface Backend {
  isAdmin: (userId: string) => Promise<boolean>;
  getToken: (userId: string) => Promise<string>;
  saveNickname: (userId: string, nickname: string) => Promise<void>;
  getUserData: <T>(userId: string, field?: string) => Promise<T>;
}

export const backendToken = new InjectionToken<Backend>('backendToken');
