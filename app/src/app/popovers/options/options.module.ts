import {NgModule} from '@angular/core';

import {CommonModule} from '@angular/common';

import {IonicModule} from '@ionic/angular';

import {OptionsComponent} from './options.component';

@NgModule({
  declarations: [OptionsComponent],
  imports: [IonicModule, CommonModule],
  entryComponents: [OptionsComponent]
})
export class OptionsModule {}
