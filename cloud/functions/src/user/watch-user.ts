import {EventContext} from 'firebase-functions';
import * as admin from 'firebase-admin';

import {Flat} from '../model/flat';

import {add, findAll} from '../utils/flats.utils';

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
            return add(`/flats/${userRecord.uid}/`, flat.data);
        });

        await Promise.all(promises);
    } catch (err) {
        console.error(err);
    }
}
