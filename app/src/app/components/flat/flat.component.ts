import {Component, EventEmitter, Input, Output} from '@angular/core';

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

    @Output()
    options: EventEmitter<UIEvent> = new EventEmitter();

    toDateObj(flatDate): Date {
        return toDateObj(flatDate);
    }

    openOptions($event: UIEvent) {
        $event.stopPropagation();

        this.options.emit($event);
    }
}
