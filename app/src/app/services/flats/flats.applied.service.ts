import {Injectable} from '@angular/core';

import {QueryDocumentSnapshot} from '@angular/fire/firestore';

import {BehaviorSubject, Observable} from 'rxjs';
import {take} from 'rxjs/operators';

import {UserFlat, UserFlatData, UserFlatStatus} from '../../model/user.flat';

import {FindFlats, FlatsService} from './flats.service';

import {FlatsServiceInterface} from './flats.service.interface';

@Injectable({
  providedIn: 'root'
})
export class FlatsAppliedService implements FlatsServiceInterface {
  private flatsSubject: BehaviorSubject<UserFlat[] | undefined> = new BehaviorSubject(undefined);
  private lastPageReached: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private nextQueryAfter: QueryDocumentSnapshot<UserFlatData>;

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
    return UserFlatStatus.APPLIED;
  }

  async find() {
    this.lastPageReached.pipe(take(1)).subscribe(async (reached: boolean) => {
      if (!reached) {
        await this.flatsService.find(this.nextQueryAfter, this.status(), this.findFlats);
      }
    });
  }

  private findFlats = async (result: FindFlats) => {
    this.nextQueryAfter = result.nextQueryAfter;

    result.query.pipe(take(1)).subscribe(async (flats: UserFlat[]) => {
      await this.flatsService.addFlats(flats, this.flatsSubject, this.lastPageReached);
    });
  };
}
