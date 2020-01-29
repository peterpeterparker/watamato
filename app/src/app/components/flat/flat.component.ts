import {Component, ElementRef, EventEmitter, Input, Output} from '@angular/core';

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

    @Input()
    mobile: boolean;

    @Output()
    options: EventEmitter<{ $event: UIEvent, elementRef: HTMLElement }> = new EventEmitter();

    constructor(private hostElement: ElementRef) {

    }

    toDateObj(flatDate): Date {
        return toDateObj(flatDate);
    }

    openOptions($event: UIEvent) {
        $event.stopPropagation();

        this.options.emit({
            $event,
            elementRef: this.hostElement.nativeElement
        });
    }
}
