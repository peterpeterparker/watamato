import { FlatData } from "./flat";

interface UserFlatData extends FlatData {
  status:
    | "new"
    | "bookmarked"
    | "disliked"
    | "viewing"
    | "applied"
    | "rejected"
    | "winning";
}
