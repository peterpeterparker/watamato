import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { EventContext } from "firebase-functions";

import { FlatData } from "../model/flat";

import { crawlRonorp } from "../crawler/ronorp";
import { crawlHomegate } from "../crawler/homegate";
import { crawlFlatfox } from "../crawler/flatfox";

import { save } from "../utils/flats.utils";
import { failure, successful } from "../utils/tasks.utils";

export async function watchTaskCreate(
  snapshot: DocumentSnapshot,
  context: EventContext
) {
  const taskId: string = context.params.taskId;

  if (!taskId || taskId === undefined || taskId === "") {
    return;
  }

  try {
    let elements: FlatData[] = [];

    const errors = {
      ronorp: false,
      homegate: false,
      flatfox: false
    };

    try {
      const ronorpElements: FlatData[] | undefined = await crawlRonorp();
      if (ronorpElements !== undefined) {
        elements = [...ronorpElements];
      }
    } catch (err) {
      console.error("Ronorp err", err);
      errors.ronorp = true;
    }

    try {
      const homegateElements: FlatData[] | undefined = await crawlHomegate();
      if (homegateElements !== undefined) {
        elements = [...elements, ...homegateElements];
      }
    } catch (err) {
      console.error("Homegate err", err);
      errors.homegate = true;
    }

    try {
      const flatfoxElements: FlatData[] | undefined = await crawlFlatfox();
      if (flatfoxElements !== undefined) {
        elements = [...elements, ...flatfoxElements];
      }
    } catch (err) {
      console.error("Flatfox err", err);
      errors.flatfox = true;
    }

    if (errors.ronorp && errors.homegate && errors.flatfox) {
      throw new Error("All in errors");
    }

    await save(elements);

    await successful(taskId);

    console.log(
      `Crawl done. ${elements ? elements.length : 0} elements found.`
    );
  } catch (err) {
    console.error(err);
    await failure(taskId);
  }
}
