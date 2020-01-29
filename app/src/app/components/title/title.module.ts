import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {TitleComponent} from './title.component';

@NgModule({
  declarations: [TitleComponent],
  imports: [CommonModule, IonicModule],
  exports: [TitleComponent]
})
export class TitleModule {}
