import {Injectable} from '@angular/core';

import {firebase} from '@firebase/app';
import '@firebase/firestore';

import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {filter, take} from 'rxjs/operators';

import {User} from '../../model/user';
import {UserFlatData, UserFlatStatus} from '../../model/user.flat';

import {UserService} from './user.service';

@Injectable({
    providedIn: 'root'
})
export class UserFlatsService {

    constructor(private fireStore: AngularFirestore,
                private userService: UserService) {

    }

    updateStatus(flatId: string, status: UserFlatStatus): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!flatId || flatId === undefined || flatId === '') {
                reject('No flat id');
                return;
            }

            try {
                this.userService.watch().pipe(filter(user => user !== undefined), take(1)).subscribe(async (user: User) => {
                    const doc: AngularFirestoreDocument<UserFlatData> = this.fireStore.doc<UserFlatData>(`/users/${user.id}/flats/${flatId}`);
                    // @ts-ignore
                    await doc.set({
                        status,
                        updated_at: firebase.firestore.Timestamp.now()
                    }, {merge: true});
                });
            } catch (err) {
                reject(err);
            }
        });
    }

}
