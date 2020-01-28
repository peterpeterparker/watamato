import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';

import {Observable, Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {Flat} from '../../model/flat';

import {FlatsService} from '../../services/flats/flats.service';

import {toDateObj} from '../../utils/date.utils';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {

    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

    flats$: Observable<Flat[]>;

    loaded = false;

    private lastPageReachedSubscription: Subscription;

    constructor(private flatsService: FlatsService) {
    }

    async ngOnInit() {
        this.flats$ = this.flatsService.watchFlats();

        this.lastPageReachedSubscription = this.flatsService.watchLastPageReached().subscribe((reached: boolean) => {
            if (reached && this.infiniteScroll) {
                this.loaded = true;
                this.infiniteScroll.disabled = true;
            }
        });

        this.flatsService.watchFlats().pipe(filter(flats => flats !== undefined), take(1)).subscribe((_flats: Flat[]) => {
            this.loaded = true;
        });
    }

    ngOnDestroy() {
        if (this.lastPageReachedSubscription) {
            this.lastPageReachedSubscription.unsubscribe();
        }
    }

    async findNext($event) {
        setTimeout(async () => {
            await this.flatsService.find();
            $event.target.complete();
        }, 500);
    }

    toDateObj(flatDate): Date {
        return toDateObj(flatDate);
    }

}
