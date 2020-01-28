import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {UserFlat, UserFlatData} from '../../model/user.flat';
import {User} from '../../model/user';

import {UserService} from '../user/user.service';

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    private flatsSubject: BehaviorSubject<UserFlat[] | undefined> = new BehaviorSubject(undefined);
    private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private nextQueryAfter: QueryDocumentSnapshot<UserFlatData>;
    private queryLimit = 2;

    private paginationSubscription: Subscription;
    private findSubscription: Subscription;

    constructor(private fireStore: AngularFirestore,
                private userService: UserService) {
    }

    async init() {
        await this.find();
    }

    destroy() {
        this.unsubscribe();
    }

    private unsubscribe() {
        if (this.paginationSubscription) {
            this.paginationSubscription.unsubscribe();
        }

        if (this.findSubscription) {
            this.findSubscription.unsubscribe();
        }
    }

    watchFlats(): Observable<UserFlat[]> {
        return this.flatsSubject.asObservable();
    }

    watchLastPageReached(): Observable<boolean> {
        return this.lastPageReached.asObservable();
    }

    find() {
        try {
            this.userService.watch().pipe(filter(user => user !== undefined), take(1)).subscribe(async (user: User) => {
                const collection: AngularFirestoreCollection<UserFlatData> = this.getCollectionQuery(user);

                this.unsubscribe();

                this.paginationSubscription = collection.get().subscribe(async (first) => {
                    this.nextQueryAfter = first.docs[first.docs.length - 1] as QueryDocumentSnapshot<UserFlatData>;

                    await this.query(collection);
                });
            });
        } catch (err) {
            throw err;
        }
    }

    private getCollectionQuery(user: User): AngularFirestoreCollection<UserFlatData> {
        const collectionName = `/users/${user.id}/flats/`;

        if (this.nextQueryAfter) {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', 'new')
                    .orderBy('created_at', 'desc')
                    .startAfter(this.nextQueryAfter)
                    .limit(this.queryLimit));
        } else {
            return this.fireStore.collection<UserFlatData>(collectionName, ref =>
                ref.where('status', '==', 'new')
                    .orderBy('created_at', 'desc')
                    .limit(this.queryLimit));
        }
    }

    private query(collection: AngularFirestoreCollection<UserFlatData>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.findSubscription = collection.snapshotChanges().pipe(
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
                ).subscribe(async (flats: UserFlat[]) => {
                    await this.addFlats(flats);

                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private addFlats(flats: UserFlat[]): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!flats || flats.length <= 0) {
                this.lastPageReached.next(true);

                resolve();
                return;
            }

            this.flatsSubject.asObservable().pipe(take(1)).subscribe((currentFlats: UserFlat[]) => {
                this.flatsSubject.next(currentFlats !== undefined ? [...currentFlats, ...flats] : [...flats]);

                resolve();
            });
        });
    }
}
