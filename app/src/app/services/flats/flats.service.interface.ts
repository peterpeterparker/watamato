import {Observable} from 'rxjs';
import {UserFlat} from '../../model/user.flat';

export interface FlatsServiceInterface {

    init(): Promise<void>;
    destroy();

    watchFlats(): Observable<UserFlat[]>;
    watchLastPageReached(): Observable<boolean>;

    status(): 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner';

    find(): Promise<void>;
}
