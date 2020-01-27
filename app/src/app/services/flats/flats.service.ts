import {Injectable} from '@angular/core';

import {User} from 'firebase';

import {AuthService} from '../auth/auth.service';
import {filter, take} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FlatsService {

    constructor(private authService: AuthService) {
    }

    init() {
        this.authService.user().pipe(take(1), filter(user => user !== undefined)).subscribe(async (user: User) => {
            // TODO Init search
            console.log('find', user);
        });
    }

    destroy() {

    }
}
