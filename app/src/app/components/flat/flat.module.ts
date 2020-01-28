import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IonicModule} from '@ionic/angular';
import {FlatComponent} from './flat.component';


@NgModule({
    declarations: [
        FlatComponent
    ],
    imports: [
        CommonModule,
        IonicModule
    ],
    exports: [
        FlatComponent
    ]
})
export class FlatModule {
}
