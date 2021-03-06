import {Component, OnInit} from '@angular/core';
import {NavParams, PopoverController} from '@ionic/angular';

import {UserFlat, UserFlatStatus} from '../../model/user.flat';

import {UserFlatsService} from '../../services/user/user.flats.service';
import {MsgService} from '../../services/msg/msg.service';
import {openMap} from '../../utils/map.utils';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss']
})
export class OptionsComponent implements OnInit {
  private cardRef: HTMLElement;

  status: UserFlatStatus;
  flat: UserFlat;

  constructor(
    private navParams: NavParams,
    private popoverController: PopoverController,
    private userFlatsService: UserFlatsService,
    private msgService: MsgService
  ) {}

  ngOnInit() {
    this.cardRef = this.navParams.get('cardRef');
    this.flat = this.navParams.get('flat');

    this.status = this.flat.data.status;
  }

  private async close() {
    await this.popoverController.dismiss();
  }

  async move(status: string) {
    try {
      await this.userFlatsService.update(this.flat.id, status as UserFlatStatus);

      await this.moveElement('div', status);

      await this.close();
    } catch (err) {
      this.msgService.error('Oopsie something went wrong.');
    }
  }

  openGoogleMap() {
    openMap(this.flat.data.location);
  }

  async delete() {
    try {
      await this.userFlatsService.update(this.flat.id, UserFlatStatus.DISLIKED);

      await this.moveElement('section', 'disliked');

      this.msgService.msg('Removed.');

      await this.close();
    } catch (err) {
      this.msgService.error('Oopsie something went wrong.');
    }
  }

  private moveElement(container: string, status: string): Promise<void> {
    return new Promise<void>((resolve) => {
      const column: HTMLDivElement = document.querySelector(`${container}[status="${status}"]`);

      if (!column) {
        resolve();
        return;
      }

      column.appendChild(this.cardRef);

      resolve();
    });
  }
}
