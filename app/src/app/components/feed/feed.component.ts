import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IonInfiniteScroll, Platform, PopoverController, ToastController} from '@ionic/angular';

import {DragulaService} from 'ng2-dragula';

import {Observable, Subject, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';

import {UserFlat, UserFlatStatus} from '../../model/user.flat';

import {UserFlatsService} from '../../services/user/user.flats.service';

import {FlatsNewService} from '../../services/flats/flats.new.service';
import {FlatsServiceInterface} from '../../services/flats/flats.service.interface';
import {FlatsAppliedService} from '../../services/flats/flats.applied.service';
import {FlatsRejectedService} from '../../services/flats/flats.rejected.service';
import {FlatsViewingService} from '../../services/flats/flats.viewing.service';
import {FlatsWinningService} from '../../services/flats/flats.winning.service';
import {OptionsComponent} from '../../popovers/options/options.component';
import {MsgService} from '../../services/msg/msg.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;

  flatsNew$: Observable<UserFlat[]>;
  flatsViewing$: Observable<UserFlat[]>;
  flatsApplied$: Observable<UserFlat[]>;
  flatsRejected$: Observable<UserFlat[]>;
  flatsWinning$: Observable<UserFlat[]>;

  loaded = false;

  private statusLoaded: UserFlatStatus[] = [];
  private statusLastPageReached: UserFlatStatus[] = [];

  private unsubscribeLastPageReached: Subject<void> = new Subject();

  private dragulaSubscription: Subscription = new Subscription();

  // -1 as we don't display 'dislike' status
  private statusLength = Object.keys(UserFlatStatus).length - 1;

  // If a card is moved and then put back to its origin, then a click will be triggered.
  // As card links to external URl, we want to catch this to not open a link when it was not what the user was looking to do.
  private cardBackToOrigin = false;

  constructor(
    private dragulaService: DragulaService,
    private platform: Platform,
    private popoverController: PopoverController,
    private userFlatsService: UserFlatsService,
    private flatsNewService: FlatsNewService,
    private flatsAppliedService: FlatsAppliedService,
    private flatsViewingService: FlatsViewingService,
    private flatsRejectedService: FlatsRejectedService,
    private flatsWinningService: FlatsWinningService,
    private msgService: MsgService
  ) {}

  async ngOnInit() {
    await this.initDragula();

    this.flatsNew$ = this.flatsNewService.watchFlats();
    this.flatsViewing$ = this.flatsViewingService.watchFlats();
    this.flatsApplied$ = this.flatsAppliedService.watchFlats();
    this.flatsRejected$ = this.flatsRejectedService.watchFlats();
    this.flatsWinning$ = this.flatsWinningService.watchFlats();

    const promises: Promise<void>[] = [
      this.watchLoad(this.flatsNewService),
      this.watchLoad(this.flatsAppliedService),
      this.watchLoad(this.flatsViewingService),
      this.watchLoad(this.flatsRejectedService),
      this.watchLoad(this.flatsWinningService),
      this.watchLastPageReached(this.flatsNewService),
      this.watchLastPageReached(this.flatsAppliedService),
      this.watchLastPageReached(this.flatsViewingService),
      this.watchLastPageReached(this.flatsRejectedService),
      this.watchLastPageReached(this.flatsWinningService)
    ];

    await Promise.all(promises);
  }

  private initDragula(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.isMobile()) {
        this.dragulaService.createGroup('bag', {
          moves: (el, target, source, sibling) => {
            return false;
          },
          accepts: (el, target, source, sibling) => {
            return false;
          }
        });
      }

      this.dragulaSubscription.add(
        this.dragulaService.drag('bag').subscribe(({el}) => {
          this.cardBackToOrigin = false;
        })
      );

      this.dragulaSubscription.add(
        this.dragulaService.cloned('bag').subscribe(({clone, original, cloneType}) => {
          setTimeout(() => {
            (clone as HTMLElement).style.transform = 'rotate(5deg)';
          }, 10);
          this.cardBackToOrigin = false;
        })
      );

      this.dragulaSubscription.add(
        this.dragulaService.cancel('bag').subscribe(({el}) => {
          this.cardBackToOrigin = true;
        })
      );

      this.dragulaSubscription.add(
        this.dragulaService.over('bag').subscribe(({el, container, source}) => {
          this.highlightMirrorCardForDelete(container as HTMLElement, true);
        })
      );

      this.dragulaSubscription.add(
        this.dragulaService.out('bag').subscribe(({el, container, source}) => {
          this.highlightMirrorCardForDelete(container as HTMLElement, false);
        })
      );

      this.dragulaSubscription.add(
        this.dragulaService.drop('bag').subscribe(async ({el, target, source, sibling}) => {
          try {
            // Index of the card in its new column
            const index = [...Array.from(el.parentElement.children)].indexOf(el);

            await this.userFlatsService.update(el.getAttribute('key'), target.getAttribute('status') as UserFlatStatus, index);

            await this.presentDeleteToast(target.getAttribute('status') as UserFlatStatus);

            await this.findAll();
          } catch (err) {
            this.msgService.error('Oopsie something went wrong.');
          }
        })
      );

      resolve();
    });
  }

  private highlightMirrorCardForDelete(container: HTMLElement, highlight: boolean) {
    if ((container.getAttribute('status') as UserFlatStatus) === UserFlatStatus.DISLIKED) {
      const mirror: HTMLElement = document.querySelector('body > ion-card');

      if (!mirror) {
        return;
      }

      if (highlight) {
        mirror.classList.add('delete');
      } else {
        mirror.classList.remove('delete');
      }
    }
  }

  private async watchLoad(service: FlatsServiceInterface) {
    service
      .watchFlats()
      .pipe(
        filter((flats) => flats !== undefined),
        take(1)
      )
      .subscribe((_flats: UserFlat[]) => {
        this.initLoaded(service);
      });
  }

  private async watchLastPageReached(service: FlatsServiceInterface) {
    service
      .watchLastPageReached()
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
      await this.findAll();
      $event.target.complete();
    }, 500);
  }

  private async findAll() {
    const promises: Promise<void>[] = [
      this.flatsNewService.find(),
      this.flatsAppliedService.find(),
      this.flatsViewingService.find(),
      this.flatsRejectedService.find(),
      this.flatsWinningService.find()
    ];

    await Promise.all(promises);
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

  private async presentDeleteToast(status: UserFlatStatus) {
    if (status !== UserFlatStatus.DISLIKED) {
      return;
    }

    this.msgService.msg('Removed.');
  }

  isMobile(): boolean {
    return this.platform.is('mobile');
  }

  async presentOptionsPopover($event: {$event: UIEvent; elementRef: HTMLElement}, flat: UserFlat) {
    const popover = await this.popoverController.create({
      component: OptionsComponent,
      componentProps: {
        cardRef: $event.elementRef.parentElement,
        flat
      },
      event: $event.$event,
      translucent: true,
      mode: 'ios'
    });

    await popover.present();
  }
}
