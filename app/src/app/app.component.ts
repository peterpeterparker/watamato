import {Component, OnDestroy, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AuthService} from './services/auth/auth.service';
import {FlatsService} from './services/flats/flats.service';
import {UserService} from './services/user/user.service';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private authService: AuthService,
        private flatsService: FlatsService,
        private userService: UserService
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    async ngOnInit() {
        await this.authService.anonymousLogin();
        await this.flatsService.init();

        this.userService.init();
    }

    ngOnDestroy() {
        this.flatsService.destroy();
        this.userService.destroy();
    }
}
