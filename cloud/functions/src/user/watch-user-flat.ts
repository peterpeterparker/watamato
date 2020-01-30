import { firestore } from "firebase-admin";
import { Change, EventContext } from "firebase-functions";
import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";

import { UserFlatData } from "../model/user.flat";
import { User } from "../model/user";

import { findUser, mergeUser } from "../utils/users.utils";

export async function watchUserFlatUpdate(
  change: Change<DocumentSnapshot>,
  context: EventContext
) {
  const oldValue: UserFlatData = change.before.data() as UserFlatData;

  const newValue: UserFlatData = change.after.data() as UserFlatData;

  if (!newValue || newValue.position === undefined) {
    return;
  }

  const userId: string = context.params.userId;

  if (!userId || userId === undefined || userId === "") {
    return;
  }

  const flatId: string = context.params.flatId;

  if (!flatId || flatId === undefined || flatId === "") {
    return;
  }

  try {
    const user: User = await findUser(userId);

    updateOldPosition(oldValue, user, flatId);

    updateNewPosition(newValue, user, flatId);

    user.data.updated_at = firestore.Timestamp.now();

    await mergeUser(user.id, user.data);
  } catch (err) {
    console.error(err);
  }
}

function updateNewPosition(newValue: UserFlatData, user: User, flatId: string) {
  if (!newValue || newValue.position === undefined) {
    return;
  }

  if (newValue.status === "winning") {
    if (!user.data.winning_ids || user.data.winning_ids === undefined) {
      user.data.winning_ids = [flatId];
    } else {
      user.data.winning_ids.splice(newValue.position, 0, flatId);
    }
  } else if (newValue.status === "rejected") {
    if (!user.data.rejected_ids || user.data.rejected_ids === undefined) {
      user.data.rejected_ids = [flatId];
    } else {
      user.data.rejected_ids.splice(newValue.position, 0, flatId);
    }
  } else if (newValue.status === "applied") {
    if (!user.data.applied_ids || user.data.applied_ids === undefined) {
      user.data.applied_ids = [flatId];
    } else {
      user.data.applied_ids.splice(newValue.position, 0, flatId);
    }
  } else if (newValue.status === "bookmarked") {
    if (!user.data.bookmarked_ids || user.data.bookmarked_ids === undefined) {
      user.data.bookmarked_ids = [flatId];
    } else {
      user.data.bookmarked_ids.splice(newValue.position, 0, flatId);
    }
  } else if (newValue.status === "viewing") {
    if (!user.data.viewing_ids || user.data.viewing_ids === undefined) {
      user.data.viewing_ids = [flatId];
    } else {
      user.data.viewing_ids.splice(newValue.position, 0, flatId);
    }
  } else if (newValue.status === "disliked") {
    if (!user.data.disliked_ids || user.data.disliked_ids === undefined) {
      user.data.disliked_ids = [flatId];
    } else {
      user.data.disliked_ids.splice(newValue.position, 0, flatId);
    }
  } else {
    if (!user.data.new_ids || user.data.new_ids === undefined) {
      user.data.new_ids = [flatId];
    } else {
      (user.data.new_ids as string[]).splice(newValue.position, 0, flatId);
    }
  }
}

function updateOldPosition(oldValue: UserFlatData, user: User, flatId: string) {
  if (!oldValue) {
    return;
  }

  if (oldValue.status === "winning") {
    if (user.data.winning_ids && user.data.winning_ids.indexOf(flatId) > -1) {
      user.data.winning_ids.splice(user.data.winning_ids.indexOf(flatId), 1);
    }
  } else if (oldValue.status === "rejected") {
    if (user.data.rejected_ids && user.data.rejected_ids.indexOf(flatId) > -1) {
      user.data.rejected_ids.splice(user.data.rejected_ids.indexOf(flatId), 1);
    }
  } else if (oldValue.status === "applied") {
    if (user.data.applied_ids && user.data.applied_ids.indexOf(flatId) > -1) {
      user.data.applied_ids.splice(user.data.applied_ids.indexOf(flatId), 1);
    }
  } else if (oldValue.status === "bookmarked") {
    if (
      user.data.bookmarked_ids &&
      user.data.bookmarked_ids.indexOf(flatId) > -1
    ) {
      user.data.bookmarked_ids.splice(
        user.data.bookmarked_ids.indexOf(flatId),
        1
      );
    }
  } else if (oldValue.status === "viewing") {
    if (user.data.viewing_ids && user.data.viewing_ids.indexOf(flatId) > -1) {
      user.data.viewing_ids.splice(user.data.viewing_ids.indexOf(flatId), 1);
    }
  } else if (oldValue.status === "disliked") {
    if (user.data.disliked_ids && user.data.disliked_ids.indexOf(flatId) > -1) {
      user.data.disliked_ids.splice(user.data.disliked_ids.indexOf(flatId), 1);
    }
  } else {
    if (
      user.data.new_ids &&
      (user.data.new_ids as string[]).indexOf(flatId) > -1
    ) {
      (user.data.new_ids as string[]).splice(
        (user.data.new_ids as string[]).indexOf(flatId),
        1
      );
    }
  }
}
