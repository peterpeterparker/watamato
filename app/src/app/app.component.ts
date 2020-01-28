import {Component, OnDestroy, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';
import {FlatsNewService} from './services/flats/flats.new.service';
import {FlatsDislikedService} from './services/flats/flats.disliked.service';

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

        await this.flatsNewService.init();
        await this.flatsDislikedService.init();

        this.userService.init();
    }

    ngOnDestroy() {
        this.flatsNewService.destroy();
        this.flatsDislikedService.destroy();

        this.userService.destroy();
    }
}
