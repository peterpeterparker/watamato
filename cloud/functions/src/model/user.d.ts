import { firestore } from "firebase-admin";

interface UserData {
  new_ids: string[] | firestore.FieldValue;
  disliked_ids?: string[];
  applied_ids?: string[];
  viewing_ids?: string[];
  rejected_ids?: string[];
  winning_ids?: string[];

  created_at?: firestore.Timestamp;
  updated_at: firestore.Timestamp;
}

interface User {
  id: string;
  ref: firestore.DocumentReference;

  data: UserData;
}
