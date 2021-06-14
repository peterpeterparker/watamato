import {Injectable} from '@angular/core';

import {AngularFireAuth} from '@angular/fire/auth';
import {User} from '@firebase/auth-types';

import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private angularFireAuth: AngularFireAuth) {}

  async anonymousLogin(): Promise<void> {
    await this.angularFireAuth.signInAnonymously();
  }

  user(): Observable<User> {
    return this.angularFireAuth.authState;
  }
}
