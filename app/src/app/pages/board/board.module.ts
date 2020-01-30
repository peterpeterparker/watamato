import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {BoardPage} from './board.page';

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
        component: BoardPage
      }
    ]),
    FeedModule,
    TitleModule
  ],
  declarations: [BoardPage]
})
export class BoardPageModule {}
