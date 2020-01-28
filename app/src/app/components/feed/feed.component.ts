import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';

import {DragulaService} from 'ng2-dragula';

import {Observable, Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {UserFlat} from '../../model/user.flat';

import {FlatsService} from '../../services/flats/flats.service';

import {toDateObj} from '../../utils/date.utils';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {

    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

    flats$: Observable<UserFlat[]>;

    loaded = false;

    private lastPageReachedSubscription: Subscription;

    private dragulaSubscription: Subscription = new Subscription();

    // If a card is moved and then put back to its origin, then a click will be triggered.
    // As card links to external URl, we want to catch this to not open a link when it was not what the user was looking to do.
    private cardBackToOrigin = false;

    constructor(private dragulaService: DragulaService,
                private flatsService: FlatsService) {

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
                console.log(el);
                this.cardBackToOrigin = true;
            })
        );

        this.dragulaSubscription.add(dragulaService.drop('bag')
            .subscribe(({el, target, source, sibling}) => {
                // TODO update status
                console.log('DROP', el, target, source, sibling);
            })
        );
    }

    async ngOnInit() {
        this.flats$ = this.flatsService.watchFlats();

        this.lastPageReachedSubscription = this.flatsService.watchLastPageReached().subscribe((reached: boolean) => {
            if (reached && this.infiniteScroll) {
                this.loaded = true;
                this.infiniteScroll.disabled = true;
            }
        });

        this.flatsService.watchFlats().pipe(filter(flats => flats !== undefined), take(1)).subscribe((_flats: UserFlat[]) => {
            this.loaded = true;
        });
    }

    ngOnDestroy() {
        if (this.lastPageReachedSubscription) {
            this.lastPageReachedSubscription.unsubscribe();
        }

        if (this.dragulaSubscription) {
            this.dragulaSubscription.unsubscribe();
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

    open(flat: UserFlat) {
        if (this.cardBackToOrigin) {
            this.cardBackToOrigin = !this.cardBackToOrigin;
            return;
        }

        window.open(flat.data.url, '_blank');
    }

}
