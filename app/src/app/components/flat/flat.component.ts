import {Component, Input} from '@angular/core';

import {toDateObj} from '../../utils/date.utils';

import {UserFlat} from '../../model/user.flat';

@Component({
    selector: 'app-flat',
    templateUrl: './flat.component.html',
    styleUrls: ['./flat.component.scss'],
})
export class FlatComponent {

    @Input()
    flat: UserFlat;

    toDateObj(flatDate): Date {
        return toDateObj(flatDate);
    }

}
