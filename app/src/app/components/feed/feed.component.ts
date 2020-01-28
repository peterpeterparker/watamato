import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';

import {DragulaService} from 'ng2-dragula';

import {Observable, Subject, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';

import {UserFlat, UserFlatStatus} from '../../model/user.flat';

import {FlatsNewService} from '../../services/flats/flats.new.service';
import {FlatsDislikedService} from '../../services/flats/flats.disliked.service';
import {FlatsServiceInterface} from '../../services/flats/flats.service.interface';
import {UserFlatsService} from '../../services/user/user.flats.service';
import {FlatsAppliedService} from '../../services/flats/flats.applied.service';
import {FlatsRejectedService} from '../../services/flats/flats.rejected.service';
import {FlatsViewingService} from '../../services/flats/flats.viewing.service';
import {FlatsWinningService} from '../../services/flats/flats.winning.service';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {

    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

    flatsNew$: Observable<UserFlat[]>;
    flatsDisliked$: Observable<UserFlat[]>;
    flatsViewing$: Observable<UserFlat[]>;
    flatsApplied$: Observable<UserFlat[]>;
    flatsRejected$: Observable<UserFlat[]>;
    flatsWinning$: Observable<UserFlat[]>;

    loaded = false;

    private statusLoaded: UserFlatStatus[] = [];
    private statusLastPageReached: UserFlatStatus[] = [];

    private unsubscribeLastPageReached: Subject<void> = new Subject();

    private dragulaSubscription: Subscription = new Subscription();

    private statusLength = Object.keys(UserFlatStatus).length;

    // If a card is moved and then put back to its origin, then a click will be triggered.
    constructor(private dragulaService: DragulaService,
                private userFlatsService: UserFlatsService,
                private flatsNewService: FlatsNewService,
                private flatsDislikedService: FlatsDislikedService,
                private flatsAppliedService: FlatsAppliedService,
                private flatsViewingService: FlatsViewingService,
                private flatsRejectedService: FlatsRejectedService,
                private flatsWinningService: FlatsWinningService) {

        this.dragulaSubscription.add(dragulaService.drag('bag')
            .subscribe(({el}) => {
                this.cardBackToOrigin = false;
            })
        );

        this.dragulaSubscription.add(dragulaService.cloned('bag')
            .subscribe(({clone, original, cloneType}) => {
                setTimeout(() => {
                    (clone as HTMLElement).style.transform = 'rotate(5deg)';
                }, 10);
                this.cardBackToOrigin = false;
            })
        );

        this.dragulaSubscription.add(dragulaService.cancel('bag')
            .subscribe(({el}) => {
                this.cardBackToOrigin = true;
            })
        );

        this.dragulaSubscription.add(dragulaService.drop('bag')
            .subscribe(async ({el, target, source, sibling}) => {
                await userFlatsService.updateStatus(el.getAttribute('key'), target.getAttribute('status') as UserFlatStatus);
            })
        );
    }

    // As card links to external URl, we want to catch this to not open a link when it was not what the user was looking to do.
    private cardBackToOrigin = false;

    async ngOnInit() {
        this.flatsNew$ = this.flatsNewService.watchFlats();
        this.flatsDisliked$ = this.flatsDislikedService.watchFlats();
        this.flatsViewing$ = this.flatsViewingService.watchFlats();
        this.flatsApplied$ = this.flatsAppliedService.watchFlats();
        this.flatsRejected$ = this.flatsRejectedService.watchFlats();
        this.flatsWinning$ = this.flatsWinningService.watchFlats();

        const promises: Promise<void>[] = [
            this.watchLoad(this.flatsNewService),
            this.watchLoad(this.flatsDislikedService),
            this.watchLoad(this.flatsAppliedService),
            this.watchLoad(this.flatsViewingService),
            this.watchLoad(this.flatsRejectedService),
            this.watchLoad(this.flatsWinningService),
            this.watchLastPageReached(this.flatsNewService),
            this.watchLastPageReached(this.flatsDislikedService),
            this.watchLastPageReached(this.flatsAppliedService),
            this.watchLastPageReached(this.flatsViewingService),
            this.watchLastPageReached(this.flatsRejectedService),
            this.watchLastPageReached(this.flatsWinningService)
        ];

        await Promise.all(promises);
    }

    private async watchLoad(service: FlatsServiceInterface) {
        service.watchFlats().pipe(filter(flats => flats !== undefined), take(1)).subscribe((_flats: UserFlat[]) => {
            this.initLoaded(service);
        });
    }

    private async watchLastPageReached(service: FlatsServiceInterface) {
        service.watchLastPageReached()
            .pipe(takeUntil(this.unsubscribeLastPageReached.asObservable()))
            .subscribe((reached: boolean) => {
                if (reached) {
                    this.statusLastPageReached.push(service.status());

                    if (this.statusLoaded.indexOf(service.status()) === -1) {
                        this.initLoaded(service);
                    }

                    if (this.statusLastPageReached.length >= this.statusLength && this.infiniteScroll) {
                        this.loaded = true;
                        this.infiniteScroll.disabled = true;
                    }
                }
            });
    }

    ngOnDestroy() {
        this.unsubscribeLastPageReached.next();
        this.unsubscribeLastPageReached.complete();

        if (this.dragulaSubscription) {
            this.dragulaSubscription.unsubscribe();
        }
    }

    async findNext($event) {
        setTimeout(async () => {
            await this.flatsNewService.find();
            await this.flatsDislikedService.find();

            $event.target.complete();
        }, 500);
    }

    open(flat: UserFlat) {
        if (this.cardBackToOrigin) {
            this.cardBackToOrigin = !this.cardBackToOrigin;
            return;
        }

        window.open(flat.data.url, '_blank');
    }

    private initLoaded(service: FlatsServiceInterface) {
        this.statusLoaded.push(service.status());

        this.loaded = this.statusLoaded.length >= this.statusLength;
    }
}
