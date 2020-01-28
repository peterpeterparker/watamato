import {EventContext} from 'firebase-functions';
import * as admin from 'firebase-admin';

import {Flat} from '../model/flat';
import {UserFlatData} from '../model/user.flat';

import {add, findAll} from '../utils/flats.utils';

import {createUser} from '../utils/users.utils';

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
            const userFlatData: UserFlatData = {
                ...flat.data,
                status: 'new'
            };

            return add(`/users/${userRecord.uid}/flats/`, userFlatData);
        });

        await Promise.all(promises);

        await createUser(userRecord);
    } catch (err) {
        console.error(err);
    }
}
