import { EventContext } from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { firestore } from "firebase-admin";

import { FlatData } from "../model/flat";
import { User } from "../model/user";
import { UserFlatData } from "../model/user.flat";

import { findAllUsers, mergeUser } from "../utils/users.utils";
import { add } from "../utils/flats.utils";

export async function watchFlatCreate(
  snapshot: DocumentSnapshot,
  _context: EventContext
) {
  await cloneFlat(snapshot);
}

async function cloneFlat(snap: DocumentSnapshot) {
  const flatData: FlatData = snap.data() as FlatData;

  if (!flatData || flatData === undefined) {
    return;
  }

  try {
    const users: User[] | undefined = await findAllUsers();

    if (!users || users === undefined || users.length <= 0) {
      return;
    }

    const promises: Promise<void>[] = users.map((user: User) => {
      return cloneFlatUser(flatData, user);
    });

    await Promise.all(promises);
  } catch (err) {
    console.error(err);
  }
}

function cloneFlatUser(flatData: FlatData, user: User): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const userFlatData: UserFlatData = {
        ...flatData,
        status: "new"
      };

      const flatUserId: string = await add(
        `/users/${user.id}/flats/`,
        userFlatData
      );

      await mergeUser(user.id, {
        new_ids: firestore.FieldValue.arrayUnion(flatUserId),
        updated_at: firestore.Timestamp.now()
      });

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
