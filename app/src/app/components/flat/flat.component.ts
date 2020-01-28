import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {Observable} from 'rxjs';

import {toDateObj} from '../../utils/date.utils';

import {UserFlat} from '../../model/user.flat';

import {FlatsNewService} from '../../services/flats/flats.new.service';
import {FlatsDislikedService} from '../../services/flats/flats.disliked.service';

@Component({
    selector: 'app-flat',
    templateUrl: './flat.component.html',
    styleUrls: ['./flat.component.scss'],
})
export class FlatComponent implements OnInit {

    flats$: Observable<UserFlat[]>;

    @Input()
    status: 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner';

    @Output()
    open = new EventEmitter<UserFlat>();

    constructor(private flatsNewService: FlatsNewService,
                private flatsDislikedService: FlatsDislikedService) {
    }

    ngOnInit() {
        let service;

        if (this.status === 'disliked') {
            service = this.flatsDislikedService;
        } else {
            service = this.flatsNewService;
        }

        this.flats$ = service.watchFlats();
    }

    toDateObj(flatDate): Date {
        return toDateObj(flatDate);
    }

    openFlat(flat: UserFlat) {
        this.open.emit(flat);
    }
}
