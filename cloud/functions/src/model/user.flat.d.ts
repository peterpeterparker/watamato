import {FlatData} from './flat';

interface UserFlatData extends FlatData {
    status: 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winning';
}
