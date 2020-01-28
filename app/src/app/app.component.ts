import {Component, OnDestroy, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';
import {FlatsNewService} from './services/flats/flats.new.service';
import {FlatsDislikedService} from './services/flats/flats.disliked.service';
import {FlatsAppliedService} from './services/flats/flats.applied.service';
import {FlatsViewingService} from './services/flats/flats.viewing.service';
import {FlatsRejectedService} from './services/flats/flats.rejected.service';
import {FlatsWinningService} from './services/flats/flats.winning.service';

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
        private flatsNewService: FlatsNewService,
        private flatsDislikedService: FlatsDislikedService,
        private flatsAppliedService: FlatsAppliedService,
        private flatsViewingService: FlatsViewingService,
        private flatsRejectedService: FlatsRejectedService,
        private flatsWinningService: FlatsWinningService,
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

        const promises: Promise<void>[] = [
            this.flatsNewService.init(),
            this.flatsDislikedService.init(),
            this.flatsAppliedService.init(),
            this.flatsViewingService.init(),
            this.flatsRejectedService.init(),
            this.flatsWinningService.init()
        ];

        await Promise.all(promises);

        this.userService.init();
    }

    async ngOnDestroy() {
        const promises: Promise<void>[] = [
            this.flatsNewService.destroy(),
            this.flatsDislikedService.destroy(),
            this.flatsAppliedService.destroy(),
            this.flatsViewingService.destroy(),
            this.flatsRejectedService.destroy(),
            this.flatsWinningService.destroy()
        ];

        await Promise.all(promises);

        this.userService.destroy();
    }
}
