import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {AboutPageRoutingModule} from './about-routing.module';

import {AboutPage} from './about.page';
import {TitleModule} from '../../components/title/title.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, AboutPageRoutingModule, TitleModule],
  declarations: [AboutPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AboutPageModule {}
