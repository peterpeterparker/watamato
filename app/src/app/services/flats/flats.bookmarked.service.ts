import {Injectable} from '@angular/core';

import {BehaviorSubject, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

import {UserFlat, UserFlatStatus} from '../../model/user.flat';

import {FlatsService} from './flats.service';

import {FlatsServiceInterface} from './flats.service.interface';

@Injectable({
  providedIn: 'root'
})
export class FlatsBookmarkedService implements FlatsServiceInterface {
  private flatsSubject: BehaviorSubject<UserFlat[] | undefined> = new BehaviorSubject(undefined);
  private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private nextQueryIndex = 0;

  constructor(private flatsService: FlatsService) {}

  async init() {
    await this.find();
  }

  watchFlats(): Observable<UserFlat[]> {
    return this.flatsSubject.asObservable();
  }

  watchLastPageReached(): Observable<boolean> {
    return this.lastPageReached.asObservable();
  }

  status(): UserFlatStatus {
    return UserFlatStatus.BOOKMARKED;
  }

  async find() {
    this.lastPageReached.pipe(take(1)).subscribe(async (reached: boolean) => {
      if (!reached) {
        await this.flatsService.find(this.nextQueryIndex, this.status(), this.findFlats);
      }
    });
  }

  private findFlats = async (flats: UserFlat[]) => {
    this.nextQueryIndex = this.nextQueryIndex + this.flatsService.queryLimit();

    await this.flatsService.addFlats(flats, this.flatsSubject, this.lastPageReached);
  };
}
