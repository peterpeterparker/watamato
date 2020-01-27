import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection, QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

import {User} from 'firebase';

import {Flat, FlatData} from '../../model/flat';

import {AuthService} from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    private flatsSubject: BehaviorSubject<Flat[] | undefined> = new BehaviorSubject(undefined);
    private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private nextQueryAfter: QueryDocumentSnapshot<FlatData>;
    private queryLimit = 20;

    private paginationSubscription: Subscription;
    private findSubscription: Subscription;

    constructor(private fireStore: AngularFirestore,
                private authService: AuthService) {
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

    watchFlats(): Observable<Flat[]> {
        return this.flatsSubject.asObservable();
    }

    watchLastPageReached(): Observable<boolean> {
        return this.lastPageReached.asObservable();
    }

    find() {
        try {
            this.authService.user().pipe(take(1), filter(user => user !== undefined)).subscribe(async (user: User) => {
                const collection: AngularFirestoreCollection<FlatData> = this.getCollectionQuery(user);

                this.unsubscribe();

                this.paginationSubscription = collection.get().subscribe(async (first) => {
                    this.nextQueryAfter = first.docs[first.docs.length - 1] as QueryDocumentSnapshot<FlatData>;

                    await this.query(collection);
                });
            });
        } catch (err) {
            throw err;
        }
    }

    private getCollectionQuery(user: User): AngularFirestoreCollection<FlatData> {
        const collectionName = `/users/${user.uid}/flats/`;

        if (this.nextQueryAfter) {
            return this.fireStore.collection<FlatData>(collectionName, ref =>
                ref.orderBy('created_at', 'desc')
                    .startAfter(this.nextQueryAfter)
                    .limit(this.queryLimit));
        } else {
            return this.fireStore.collection<FlatData>(collectionName, ref =>
                ref.orderBy('created_at', 'desc')
                    .limit(this.queryLimit));
        }
    }

    private query(collection: AngularFirestoreCollection<FlatData>): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.findSubscription = collection.snapshotChanges().pipe(
                    map(actions => {
                        return actions.map(a => {
                            const data: FlatData = a.payload.doc.data() as FlatData;
                            const id = a.payload.doc.id;
                            const ref = a.payload.doc.ref;

                            return {
                                id,
                                ref,
                                data
                            };
                        });
                    })
                ).subscribe(async (flats: Flat[]) => {
                    await this.addFlats(flats);

                    resolve();
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    private addFlats(flats: Flat[]): Promise<void> {
        return new Promise<void>((resolve) => {

            console.log(flats);

            if (!flats || flats.length <= 0) {
                this.lastPageReached.next(true);

                resolve();
                return;
            }

            this.flatsSubject.asObservable().pipe(take(1)).subscribe((currentFlats: Flat[]) => {
                this.flatsSubject.next(currentFlats !== undefined ? [...currentFlats, ...flats] : [...flats]);

                console.log('yolo',  currentFlats !== undefined ? [...currentFlats, ...flats] : [...flats]);

                resolve();
            });
        });
    }
}
