import {Injectable} from '@angular/core';

import {AngularFireAuth} from '@angular/fire/auth';
import {User as FirebaseUser} from 'firebase';

import {Observable} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private angularFireAuth: AngularFireAuth) {
    }

    anonymousLogin(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                await this.angularFireAuth.auth.signInAnonymously();

                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    user(): Observable<FirebaseUser> {
        return this.angularFireAuth.authState;
    }
}
