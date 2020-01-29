import {DocumentReference} from '@angular/fire/firestore';

export interface UserData {
  new_ids?: string[];
  deleted_ids?: string[];
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
