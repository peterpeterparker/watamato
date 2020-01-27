import {DocumentReference} from '@angular/fire/firestore';

export interface FlatData {
    url: string | null;
    image_url: string | null;
    title: string | null;
    location: string | null;
    rooms: number;
    price: number;
    published_at: Date;

    created_at: firebase.firestore.Timestamp;
    updated_at: firebase.firestore.Timestamp;
}

export interface Flat {
    id: string;
    ref: DocumentReference;

    data: FlatData;
}
