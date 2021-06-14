import {DocumentReference} from '@angular/fire/firestore';

import firebase from 'firebase';

export interface UserData {
  new_ids?: string[];
  disliked_ids?: string[];
  bookmarked_ids?: string[];
  applied_ids?: string[];
  viewing_ids?: string[];
  rejected_ids?: string[];
  winning_ids?: string[];

  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
}

export interface User {
  id: string;
  ref: DocumentReference;

  data: UserData;
}
