import {Observable} from 'rxjs';

import {UserFlat, UserFlatStatus} from '../../model/user.flat';

export interface FlatsServiceInterface {
  init(): Promise<void>;

  watchFlats(): Observable<UserFlat[]>;

  watchLastPageReached(): Observable<boolean>;

  status(): UserFlatStatus;

  find(): Promise<void>;
}
