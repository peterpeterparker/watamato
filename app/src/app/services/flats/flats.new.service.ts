import {Injectable} from '@angular/core';

import {QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

import {UserFlat, UserFlatData} from '../../model/user.flat';

import {FindFlats, FlatsService} from './flats.service';

@Injectable({
    providedIn: 'root'
})
export class FlatsNewService {

    private flatsSubject: BehaviorSubject<UserFlat[] | undefined> = new BehaviorSubject(undefined);
    private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(false);

    private nextQueryAfter: QueryDocumentSnapshot<UserFlatData>;

    private paginationSubscription: Subscription;
    private findSubscription: Subscription;

    constructor(private flatsService: FlatsService) {

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

    async find() {
        await this.flatsService.find(this.nextQueryAfter, this.findFlats, () => this.unsubscribe());
    }

    private findFlats = async (result: FindFlats) => {

        console.log(result);

        this.nextQueryAfter = result.nextQueryAfter;
        this.paginationSubscription = result.paginationSubscription;

        result.query.subscribe(async (flats: UserFlat[]) => {
            await this.addFlats(flats);
        });
    };

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
