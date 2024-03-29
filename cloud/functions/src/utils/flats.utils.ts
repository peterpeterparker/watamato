import * as admin from "firebase-admin";

import { Flat, FlatData } from "../model/flat";
import { UserFlatData } from "../model/user.flat";

export async function save(flats: FlatData[] | undefined) {
  try {
    if (!flats || flats === undefined || flats.length <= 0) {
      return;
    }

    const promises: Promise<void>[] = flats.map(
      (flat: FlatData | undefined) => {
        return createOrMerge(flat);
      }
    );

    await Promise.all(promises);
  } catch (err) {
    throw err;
  }
}

function createOrMerge(flatData: FlatData | undefined): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const flat: Flat | undefined = await get(flatData);

      if (flat === undefined) {
        await add("/flats/", flatData);
      } else {
        // Right now, we don't process an update of the data
        // If this would be activated, then the a clone functions would be needed to update the users/flats too
        // await merge(flat.id, flatData);
      }

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function add(
  collectionPath: string,
  flatData: FlatData | UserFlatData | undefined
): Promise<string> {
  return new Promise<string>(async (resolve, reject) => {
    try {
      if (!flatData || flatData === undefined) {
        reject("No flat data");
        return;
      }

      const collectionRef: admin.firestore.CollectionReference = admin
        .firestore()
        .collection(collectionPath);

      flatData.created_at = admin.firestore.Timestamp.now();
      flatData.updated_at = admin.firestore.Timestamp.now();

      const doc: admin.firestore.DocumentReference = await collectionRef.add(
        flatData
      );

      resolve(doc.id);
    } catch (err) {
      reject(err);
    }
  });
}

// @ts-ignore
function merge(flatId: string, flatData: FlatData | undefined): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      if (!flatData || flatData === undefined || !flatId) {
        resolve();
        return;
      }

      const documentReference: admin.firestore.DocumentReference = admin
        .firestore()
        .doc(`/flats/${flatId}/`);

      flatData.updated_at = admin.firestore.Timestamp.now();

      await documentReference.set(flatData, { merge: true });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

function get(flatData: FlatData | undefined): Promise<Flat | undefined> {
  return new Promise<Flat | undefined>(async (resolve, reject) => {
    try {
      if (!flatData || flatData === undefined || !flatData.url) {
        reject("No flat data");
        return;
      }

      const collectionRef: admin.firestore.CollectionReference = admin
        .firestore()
        .collection("/flats/");

      const snapShot: admin.firestore.QuerySnapshot = await collectionRef
        .where("url", "==", flatData.url)
        .get();

      if (snapShot && snapShot.docs && snapShot.docs.length > 0) {
        const doc = snapShot.docs[0];

        resolve({
          id: doc.id,
          ref: doc.ref,
          data: doc.data() as FlatData
        });
      } else {
        resolve(undefined);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function findAll(): Promise<Flat[] | undefined> {
  return new Promise<Flat[] | undefined>(async (resolve, reject) => {
    try {
      const collectionRef: admin.firestore.CollectionReference = admin
        .firestore()
        .collection("/flats/");

      // TODO: Redo search 5 last days if project becomes active again
      // from.setDate(from.getDate() - 5);

      // Watamato Cloud Functions is currently discontinued, I have found a temporary lease.
      const from: Date = new Date();
      from.setDate(1);
      from.setMonth(9);
      from.setFullYear(2020);

      const snapShot: admin.firestore.QuerySnapshot = await collectionRef
        .where("published_at", ">", from)
        .get();

      if (snapShot && snapShot.docs && snapShot.docs.length > 0) {
        const flats: Flat[] = snapShot.docs.map(doc => {
          const data: Object = doc.data() as FlatData;
          const id = doc.id;
          const ref = doc.ref;

          return {
            id: id,
            ref: ref,
            data: data
          } as Flat;
        });

        resolve(flats);
      } else {
        resolve(undefined);
      }
    } catch (err) {
      reject(err);
    }
  });
}
