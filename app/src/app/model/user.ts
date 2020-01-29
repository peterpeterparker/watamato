import {DocumentReference} from '@angular/fire/firestore';

export interface UserData {
  created_at: firebase.firestore.Timestamp;
  updated_at: firebase.firestore.Timestamp;
}

export interface User {
  id: string;
  ref: DocumentReference;

  data: UserData;
}
