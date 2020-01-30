import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {IonicModule} from '@ionic/angular';

import {DragulaModule} from 'ng2-dragula';

import {FeedComponent} from './feed.component';
import {FlatModule} from '../flat/flat.module';
import {OptionsModule} from '../../popovers/options/options.module';
import {FooterModule} from '../footer/footer.module';

@NgModule({
  declarations: [FeedComponent],
  imports: [CommonModule, IonicModule, DragulaModule, FlatModule, OptionsModule, FooterModule],
  exports: [FeedComponent]
})
export class FeedModule {}
