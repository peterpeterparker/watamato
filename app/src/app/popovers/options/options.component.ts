import {Component, OnInit} from '@angular/core';
import {NavParams} from '@ionic/angular';
import {UserFlat, UserFlatStatus} from '../../model/user.flat';

@Component({
    selector: 'app-options',
    templateUrl: './options.component.html',
    styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {

    private flat: UserFlat;
    private cardRef: HTMLElement;

    status: UserFlatStatus;

    constructor(private navParams: NavParams) {
    }

    ngOnInit() {
        this.cardRef = this.navParams.get('cardRef');
        this.flat = this.navParams.get('flat');

        this.status = this.flat.data.status;
    }

}
