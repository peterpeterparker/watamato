import {DocumentReference} from '@angular/fire/firestore';

export interface UserFlatData {
    url: string | null;
    image_url: string | null;
    title: string | null;
    location: string | null;
    rooms: number;
    price: number;
    published_at: Date;

    source: 'ronorp';

    status: 'new' | 'disliked' | 'viewing' | 'applied' | 'rejected' | 'winner';

    created_at: firebase.firestore.Timestamp;
    updated_at: firebase.firestore.Timestamp;
}

export interface UserFlat {
    id: string;
    ref: DocumentReference;

    data: UserFlatData;
}
