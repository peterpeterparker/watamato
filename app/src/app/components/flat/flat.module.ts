import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';

import {FlatComponent} from './flat.component';

@NgModule({
  declarations: [FlatComponent],
  imports: [CommonModule, IonicModule],
  exports: [FlatComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FlatModule {}
