import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot} from '@angular/fire/firestore';

import {Observable, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {UserFlat, UserFlatData} from '../../model/user.flat';
import {User} from '../../model/user';

import {UserService} from '../user/user.service';

export interface FindFlats {
    nextQueryAfter: QueryDocumentSnapshot<UserFlatData>;
    paginationSubscription: Subscription;
    query: Observable<UserFlat[]>;
}

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    private queryLimit = 2;

    constructor(private fireStore: AngularFirestore,
                private userService: UserService) {
    }

    find(nextQueryAfter: QueryDocumentSnapshot<UserFlatData>, status: 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner', find: (result: FindFlats) => void, unsubscribe: () => void) {
        try {
            this.userService.watch().pipe(filter(user => user !== undefined), take(1)).subscribe(async (user: User) => {
                const collection: AngularFirestoreCollection<UserFlatData> = this.getCollectionQuery(user, nextQueryAfter, status);

                unsubscribe();

                const paginationSubscription: Subscription = collection.get().subscribe(async (first) => {
                    nextQueryAfter = first.docs[first.docs.length - 1] as QueryDocumentSnapshot<UserFlatData>;

                    find({
                        nextQueryAfter,
                        paginationSubscription,
                        query: this.query(collection, nextQueryAfter)
                    });
                });
            });
        } catch (err) {
            throw(err);
        }
    }

    private getCollectionQuery(user: User, nextQueryAfter: QueryDocumentSnapshot<UserFlatData>, status: 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner'): AngularFirestoreCollection<UserFlatData> {
        const collectionName = `/users/${user.id}/flats/`;

        if (nextQueryAfter) {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', status)
                    .orderBy('created_at', 'desc')
                    .startAfter(nextQueryAfter)
                    .limit(this.queryLimit));
        } else {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', status)
                    .orderBy('created_at', 'desc')
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
}
