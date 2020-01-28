import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll} from '@ionic/angular';

import {DragulaService} from 'ng2-dragula';

import {Subject, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';

import {UserFlat} from '../../model/user.flat';

import {FlatsNewService} from '../../services/flats/flats.new.service';
import {FlatsDislikedService} from '../../services/flats/flats.disliked.service';
import {FlatsServiceInterface} from '../../services/flats/flats.service.interface';

@Component({
    selector: 'app-feed',
    templateUrl: './feed.component.html',
    styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, OnDestroy {

    @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

    loaded = false;

    private statusLoaded: ('new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner')[] = [];
    private statusLastPageReached: ('new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner')[] = [];

    private unsubscribeLastPageReached: Subject<void> = new Subject();

    private dragulaSubscription: Subscription = new Subscription();

    // If a card is moved and then put back to its origin, then a click will be triggered.
    // As card links to external URl, we want to catch this to not open a link when it was not what the user was looking to do.
    private cardBackToOrigin = false;

    constructor(private dragulaService: DragulaService,
                private flatsNewService: FlatsNewService,
                private flatsDislikedService: FlatsDislikedService) {

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

    ngOnInit() {
        this.watchLoad(this.flatsNewService);
        this.watchLoad(this.flatsDislikedService);

        this.watchLastPageReached(this.flatsNewService);
        this.watchLastPageReached(this.flatsDislikedService);
    }

    private watchLoad(service: FlatsServiceInterface) {
        service.watchFlats().pipe(filter(flats => flats !== undefined), take(1)).subscribe((_flats: UserFlat[]) => {
            this.initLoaded(service);
        });
    }

    private watchLastPageReached(service: FlatsServiceInterface) {
        service.watchLastPageReached()
            .pipe(takeUntil(this.unsubscribeLastPageReached.asObservable()))
            .subscribe((reached: boolean) => {
                if (reached) {
                    this.statusLastPageReached.push(service.status());

                    if (this.statusLoaded.indexOf(service.status()) === -1) {
                        this.initLoaded(service);
                    }

                    // TODO
                    if (this.statusLastPageReached.length >= 2 && this.infiniteScroll) {
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

        // TODO
        this.loaded = this.statusLoaded.length >= 2;
    }
}
