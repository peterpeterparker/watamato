import {DocumentReference} from '@angular/fire/firestore';

export enum UserFlatStatus {
  NEW = 'new',
  BOOKMARKED = 'bookmarked',
  DISLIKED = 'disliked',
  VIEWING = 'viewing',
  APPLIED = 'applied',
  REJECTED = 'rejected',
  WINNING = 'winning'
}

export enum UserFlatSource {
  RONORP = 'ronorp',
  HOMEGATE = 'homegate'
}

export interface UserFlatData {
  url: string | null;
  image_url: string | null;
  title: string | null;
  location: string | null;
  rooms: number;
  price: number;
  published_at: Date;

  source: UserFlatSource;

  status: UserFlatStatus;
  position?: number;

  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
}

export interface UserFlat {
  id: string;
  ref: DocumentReference;

  data: UserFlatData;
}
