import {Injectable} from '@angular/core';

import {AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {UserFlat, UserFlatData, UserFlatStatus} from '../../model/user.flat';
import {User} from '../../model/user';

import {UserService} from '../user/user.service';

export interface FindFlats {
    nextQueryAfter: QueryDocumentSnapshot<UserFlatData>;
    query: Observable<UserFlat[]>;
}

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    private queryLimit = 2;
    private until: Date | undefined = undefined;

    constructor(private fireStore: AngularFirestore,
                private userService: UserService) {
    }

    find(nextQueryAfter: QueryDocumentSnapshot<UserFlatData>, status: UserFlatStatus, find: (result: FindFlats) => void) {
        try {
            this.userService.watch().pipe(filter(user => user !== undefined), take(1)).subscribe(async (user: User) => {
                const collection: AngularFirestoreCollection<UserFlatData> = this.getCollectionQuery(user, nextQueryAfter, status);

                collection.get().pipe(take(1)).subscribe(async (first) => {
                    nextQueryAfter = first.docs[first.docs.length - 1] as QueryDocumentSnapshot<UserFlatData>;

                    find({
                        nextQueryAfter,
                        query: this.query(collection, nextQueryAfter)
                    });
                });
            });
        } catch (err) {
            throw(err);
        }
    }

    private getCollectionQuery(user: User, nextQueryAfter: QueryDocumentSnapshot<UserFlatData>, status: UserFlatStatus): AngularFirestoreCollection<UserFlatData> {
        const collectionName = `/users/${user.id}/flats/`;

        // We take the reference on the very first search (it takes time between init and user created)
        if (this.until === undefined) {
            this.until = new Date();
        }

        if (nextQueryAfter) {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', status)
                    .where('updated_at', '<', this.until)
                    .orderBy('updated_at', 'desc')
                    .startAfter(nextQueryAfter)
                    .limit(this.queryLimit));
        } else {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', status)
                    .where('updated_at', '<', this.until)
                    .orderBy('updated_at', 'desc')
                    .limit(this.queryLimit));
        }
    }

    private query(collection: AngularFirestoreCollection<UserFlatData>, nextQueryAfter: QueryDocumentSnapshot<UserFlatData>): Observable<UserFlat[]> {
        return collection.snapshotChanges().pipe(
            map(actions => {
                return actions.map(a => {
                    const data: UserFlatData = a.payload.doc.data() as UserFlatData;
                    const id = a.payload.doc.id;
                    const ref = a.payload.doc.ref;

                    return {
                        id,
                        ref,
                        data
                    };
                });
            })
        );
    }

    addFlats(flats: UserFlat[], flatsSubject: BehaviorSubject<UserFlat[] | undefined>, lastPageReached: BehaviorSubject<boolean>): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!flats || flats.length <= 0) {
                lastPageReached.next(true);

                resolve();
                return;
            }

            flatsSubject.asObservable().pipe(take(1)).subscribe((currentFlats: UserFlat[]) => {
                flatsSubject.next(currentFlats !== undefined ? [...currentFlats, ...flats] : [...flats]);

                resolve();
            });
        });
    }
}
