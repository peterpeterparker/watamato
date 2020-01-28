import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IonicModule} from '@ionic/angular';

import {DragulaModule} from 'ng2-dragula';

import {FeedComponent} from './feed.component';

@NgModule({
    declarations: [
        FeedComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        DragulaModule
    ],
    exports: [
        FeedComponent
    ]
})
export class FeedModule {
}
