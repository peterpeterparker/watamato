import {EventContext} from 'firebase-functions';
import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';

import {FlatData} from '../model/flat';
import {User} from '../model/user';

import {findAllUsers} from '../utils/users.utils';
import {add} from '../utils/flats.utils';

export async function watchFlatCreate(snapshot: DocumentSnapshot, _context: EventContext) {
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
            return add(`/users/${user.id}/flats/`, flatData);
        });

        await Promise.all(promises);
    } catch (err) {
        console.error(err);
    }
}
