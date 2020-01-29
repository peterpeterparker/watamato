import {Component, OnDestroy, OnInit} from '@angular/core';

import {Platform, ToastController} from '@ionic/angular';

import {Subscription} from 'rxjs';

import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AuthService} from './services/auth/auth.service';
import {UserService} from './services/user/user.service';

import {FlatsNewService} from './services/flats/flats.new.service';
import {FlatsAppliedService} from './services/flats/flats.applied.service';
import {FlatsViewingService} from './services/flats/flats.viewing.service';
import {FlatsRejectedService} from './services/flats/flats.rejected.service';
import {FlatsWinningService} from './services/flats/flats.winning.service';

import {MsgService} from './services/msg/msg.service';
import {UserFlatStatus} from './model/user.flat';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private msgSubscription: Subscription;
  private errorSubscription: Subscription;

  constructor(
    private platform: Platform,
    private toastController: ToastController,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private flatsNewService: FlatsNewService,
    private flatsAppliedService: FlatsAppliedService,
    private flatsViewingService: FlatsViewingService,
    private flatsRejectedService: FlatsRejectedService,
    private flatsWinningService: FlatsWinningService,
    private userService: UserService,
    private msgService: MsgService
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
      this.flatsAppliedService.init(),
      this.flatsViewingService.init(),
      this.flatsRejectedService.init(),
      this.flatsWinningService.init()
    ];

    await Promise.all(promises);

    this.userService.init();

    this.msgSubscription = this.msgService.watchMsg().subscribe(async (msg: string) => {
      await this.presentMsgToast(msg);
    });

    this.errorSubscription = this.msgService.watchError().subscribe(async (error: string) => {
      await this.presentMsgToast(error, 'danger');
    });
  }

  async ngOnDestroy() {
    if (this.msgSubscription) {
      this.msgSubscription.unsubscribe();
    }

    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  private async presentMsgToast(msg: string, color?: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 500,
      color
    });

    await toast.present();
  }
}
