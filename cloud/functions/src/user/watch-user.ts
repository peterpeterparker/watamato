import {EventContext} from 'firebase-functions';
import * as admin from 'firebase-admin';

import {Flat} from '../model/flat';

import {add, findAll} from '../utils/flats.utils';
import {UserData} from '../model/user';

export async function watchUserCreate(userRecord: admin.auth.UserRecord, _context: EventContext) {
    await cloneFlats(userRecord);
}

async function cloneFlats(userRecord: admin.auth.UserRecord) {
    if (!userRecord || !userRecord.uid) {
        return;
    }

    try {
        const flats:  Flat[] | undefined = await findAll();

        if (!flats || flats === undefined || flats.length <= 0) {
            return;
        }

        const promises: Promise<void>[] = flats.map((flat: Flat) => {
            return add(`/users/${userRecord.uid}/flats/`, flat.data);
        });

        await Promise.all(promises);

        await create(userRecord);
    } catch (err) {
        console.error(err);
    }
}

function create(userRecord: admin.auth.UserRecord): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const documentReference: admin.firestore.DocumentReference = admin.firestore().collection('/users/').doc(userRecord.uid);

            const userData: UserData = {
                created_at: admin.firestore.Timestamp.now(),
                updated_at: admin.firestore.Timestamp.now(),
            };

            await documentReference.set(userData, {merge: true});

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}
