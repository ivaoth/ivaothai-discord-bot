import { Backend } from './backend';
import * as admin from 'firebase-admin';

export class BackendFirebaseImpl implements Backend {
  async isAdmin(userId: string) {
    const v = await admin
      .database()
      .ref('admins')
      .child(userId)
      .once('value');
    return v.exists();
  }

  async getToken(userId: string) {
    return admin
      .database()
      .ref('requests')
      .push(userId).key!;
  }

  async saveNickname(userId: string, nickname: string) {
    const userExist = this.userExist(userId);
    if (await userExist) {
      return admin
        .database()
        .ref('users')
        .child(userId)
        .child('customNickname')
        .set(nickname);
    } else {
      return Promise.resolve();
    }
  }

  async userExist(userId: string) {
    const v = await admin
      .database()
      .ref('users')
      .child(userId)
      .once('value');
    return v.exists();
  }

  async getUserData<T>(userId: string, field?: string) {
    const userRef = admin
      .database()
      .ref('users')
      .child(userId);
    const ref = field ? userRef.child(field) : userRef;
    return (await userRef.once('value')).val() as T;
  }
}
