import {Injectable} from '@angular/core';

import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {BehaviorSubject} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {UserFlat, UserFlatData, UserFlatStatus} from '../../model/user.flat';
import {User} from '../../model/user';

import {UserService} from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class FlatsService {
  private QUERY_LIMIT = 2;

  constructor(private fireStore: AngularFirestore, private userService: UserService) {}

  queryLimit(): number {
    return this.QUERY_LIMIT;
  }

  find(nextQueryIndex: number, status: UserFlatStatus, find: (flats: UserFlat[]) => void) {
    try {
      this.userService
        .watch()
        .pipe(
          filter((user) => user !== undefined),
          take(1)
        )
        .subscribe(async (user: User) => {
          const sortedIds: string[] = this.getSort(user, status);

          if (!sortedIds || sortedIds === undefined || sortedIds.length < nextQueryIndex + 1) {
            // Nothing else to do, pagination is reached or there are no such flats for the specified status
            find([]);
          } else {
            const paginationIds: string[] = sortedIds.splice(nextQueryIndex, this.QUERY_LIMIT);

            const promises: Promise<UserFlat>[] = paginationIds.map((id: string) => {
              return this.get(user.id, id);
            });

            const userFlats: UserFlat[] = await Promise.all(promises);

            find(userFlats);
          }
        });
    } catch (err) {
      throw err;
    }
  }

  private getSort(user: User, status: UserFlatStatus): string[] | undefined {
    if (status === UserFlatStatus.WINNING) {
      return user.data.winning_ids !== undefined ? [...user.data.winning_ids] : undefined;
    } else if (status === UserFlatStatus.REJECTED) {
      return user.data.rejected_ids !== undefined ? [...user.data.rejected_ids] : undefined;
    } else if (status === UserFlatStatus.APPLIED) {
      return user.data.applied_ids !== undefined ? [...user.data.applied_ids] : undefined;
    } else if (status === UserFlatStatus.VIEWING) {
      return user.data.viewing_ids !== undefined ? [...user.data.viewing_ids] : undefined;
    } else {
      return user.data.new_ids !== undefined ? [...user.data.new_ids] : undefined;
    }
  }

  addFlats(flats: UserFlat[], flatsSubject: BehaviorSubject<UserFlat[] | undefined>, lastPageReached: BehaviorSubject<boolean>): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!flats || flats.length <= 0) {
        lastPageReached.next(true);

        resolve();
        return;
      }

      flatsSubject
        .asObservable()
        .pipe(take(1))
        .subscribe((currentFlats: UserFlat[]) => {
          flatsSubject.next(currentFlats !== undefined ? [...currentFlats, ...flats] : [...flats]);

          resolve();
        });
    });
  }

  private get(userId: string, userFlatId: string): Promise<UserFlat> {
    return new Promise<UserFlat>(async (resolve, reject) => {
      const doc: AngularFirestoreDocument<UserFlatData> = this.fireStore.collection<UserFlatData>(`/users/${userId}/flats/`).doc<UserFlatData>(userFlatId);

      doc
        .valueChanges()
        .pipe(take(1))
        .subscribe(
          (data: UserFlatData) => {
            const userFlat: UserFlat = {
              id: userFlatId,
              ref: doc.ref,
              data
            };

            resolve(userFlat);
          },
          (err) => {
            reject(err);
          }
        );
    });
  }
}
