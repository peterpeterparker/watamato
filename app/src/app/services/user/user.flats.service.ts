import {Injectable} from '@angular/core';

import {firebase} from '@firebase/app';
import '@firebase/firestore';

import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {filter, take} from 'rxjs/operators';

import {User} from '../../model/user';
import {UserFlatData, UserFlatStatus} from '../../model/user.flat';

import {UserService} from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserFlatsService {
  constructor(private fireStore: AngularFirestore, private userService: UserService) {}

  update(flatId: string, status: UserFlatStatus, position?: number): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      if (!flatId || flatId === undefined || flatId === '') {
        reject('No flat id');
        return;
      }

      try {
        // prettier-ignore
        // @ts-ignore
        const data: UserFlatData = {
          status,
          updated_at: firebase.firestore.Timestamp.now()
        };

        if (position !== undefined) {
          data.position = position;
        }

        // prettier-ignore
        // @ts-ignore
        await this.updateData(flatId, data);

        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  private updateData(flatId: string, data: UserFlatData): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!flatId || flatId === undefined || flatId === '') {
        reject('No flat id');
        return;
      }

      try {
        this.userService
          .watch()
          .pipe(
            filter((user) => user !== undefined),
            take(1)
          )
          .subscribe(async (user: User) => {
            const doc: AngularFirestoreDocument<UserFlatData> = this.fireStore.doc<UserFlatData>(`/users/${user.id}/flats/${flatId}`);

            await doc.set(data, {merge: true});

            resolve();
          });
      } catch (err) {
        reject(err);
      }
    });
  }
}
