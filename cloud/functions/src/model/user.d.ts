import { firestore } from "firebase-admin";

interface UserData {
  new_ids: string[] | firestore.FieldValue;

  created_at?: firestore.Timestamp;
  updated_at: firestore.Timestamp;
}

interface User {
  id: string;
  ref: firestore.DocumentReference;

  data: UserData;
}
