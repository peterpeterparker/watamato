import { firestore } from "firebase-admin";

interface FlatData {
  url: string | null;
  image_url: string | null;
  title: string | null;
  location: string | null;
  rooms: number;
  price: number;
  published_at: Date;

  source: "ronorp" | "homegate";

  created_at?: firestore.Timestamp;
  updated_at?: firestore.Timestamp;
}

interface Flat {
  id: string;
  ref: firestore.DocumentReference;

  data: FlatData;
}
