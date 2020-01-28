import {Injectable} from '@angular/core';

import {QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

import {UserFlat, UserFlatData, UserFlatStatus} from '../../model/user.flat';

import {FindFlats, FlatsService} from './flats.service';

import {FlatsServiceInterface} from './flats.service.interface';

@Injectable({
    providedIn: 'root'
})
export class FlatsViewingService implements FlatsServiceInterface {

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

    async destroy() {
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

    status(): UserFlatStatus {
        return UserFlatStatus.VIEWING;
    }

    async find() {
        this.lastPageReached.pipe(take(1)).subscribe(async (reached: boolean) => {
            if (!reached) {
                await this.flatsService.find(this.nextQueryAfter, this.status(), this.findFlats, () => this.unsubscribe());
            }
        });
    }

    private findFlats = async (result: FindFlats) => {
        this.nextQueryAfter = result.nextQueryAfter;
        this.paginationSubscription = result.paginationSubscription;

        result.query.subscribe(async (flats: UserFlat[]) => {
            await this.flatsService.addFlats(flats, this.flatsSubject, this.lastPageReached);
        });
    };
}
