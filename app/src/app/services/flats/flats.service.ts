import {Injectable} from '@angular/core';

import {AngularFireAuth} from '@angular/fire/auth';
import {User as FirebaseUser} from 'firebase';

import {Subscription} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    private authSubscription: Subscription;

    constructor(private angularFireAuth: AngularFireAuth) {
    }

    init() {
        this.authSubscription = this.angularFireAuth.authState.subscribe(async (user: FirebaseUser) => {
            console.log(user);
        });
    }

    destroy() {
        if (this.authSubscription) {
            this.authSubscription.unsubscribe();
        }
    }
}
