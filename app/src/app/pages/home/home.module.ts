import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {HomePage} from './home.page';

import {FeedModule} from '../../components/feed/feed.module';
import {TitleModule} from '../../components/title/title.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: HomePage
            }
        ]),
        FeedModule,
        TitleModule
    ],
    declarations: [HomePage]
})
export class HomePageModule {
}
