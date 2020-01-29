import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';

import {User as FirebaseUser} from 'firebase';

import {User, UserData} from '../../model/user';

import {AuthService} from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private subscription: Subscription;

  private userSubject: BehaviorSubject<User | undefined> = new BehaviorSubject(undefined);

  constructor(private fireStore: AngularFirestore, private authService: AuthService) {}

  init() {
    this.authService
      .user()
      .pipe(
        filter((user) => user !== undefined),
        take(1)
      )
      .subscribe(async (user: FirebaseUser) => {
        try {
          await this.load(user);
        } catch (err) {
          console.error(err);
        }
      });
  }

  destroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private load(user: FirebaseUser): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!user || !user.uid) {
        resolve();
        return;
      }

      const doc: AngularFirestoreDocument<UserData> = this.fireStore.collection<UserData>('users').doc<UserData>(user.uid);

      this.subscription = doc.valueChanges().subscribe(
        (data: UserData) => {
          if (!data || data === undefined) {
            this.userSubject.next(undefined);
            resolve();
            return;
          }

          const fetchedUser: User = {
            id: user.uid,
            ref: doc.ref,
            data
          };

          this.userSubject.next(fetchedUser);

          resolve();
        },
        (err) => {
          reject(err);
        }
      );
    });
  }

  watch(): Observable<User> {
    return this.userSubject.asObservable();
  }
}
