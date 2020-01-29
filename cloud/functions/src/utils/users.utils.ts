import * as admin from "firebase-admin";

import { User, UserData } from "../model/user";

export function createUser(
  userRecord: admin.auth.UserRecord,
  flatIds: string[]
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const documentReference: admin.firestore.DocumentReference = admin
        .firestore()
        .collection("/users/")
        .doc(userRecord.uid);

      const userData: UserData = {
        new_ids: flatIds,
        created_at: admin.firestore.Timestamp.now(),
        updated_at: admin.firestore.Timestamp.now()
      };

      await documentReference.set(userData, { merge: true });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function mergeUser(
  userId: string,
  userData: UserData | undefined
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (!userData || userData === undefined || !userId) {
        resolve();
        return;
      }

      const documentReference: admin.firestore.DocumentReference = admin
        .firestore()
        .doc(`/users/${userId}/`);

      await documentReference.set(userData, { merge: true });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function findAllUsers(): Promise<User[] | undefined> {
  return new Promise<User[] | undefined>(async (resolve, reject) => {
    try {
      const collectionRef: admin.firestore.CollectionReference = admin
        .firestore()
        .collection("/users/");

      const from: Date = new Date();
      from.setDate(from.getDate() - 5);

      const snapShot: admin.firestore.QuerySnapshot = await collectionRef
        .where("updated_at", ">", from)
        .get();

      if (snapShot && snapShot.docs && snapShot.docs.length > 0) {
        const users: User[] = snapShot.docs.map(doc => {
          const data: Object = doc.data() as UserData;
          const id = doc.id;
          const ref = doc.ref;

          return {
            id: id,
            ref: ref,
            data: data
          } as User;
        });

        resolve(users);
      } else {
        resolve(undefined);
      }
    } catch (err) {
      reject(err);
    }
  });
}
