import { DocumentSnapshot } from "firebase-functions/lib/providers/firestore";
import { EventContext } from "firebase-functions";

import { FlatData } from "../model/flat";

import { crawlRonorp } from "../crawler/ronorp";
import { crawlHomegate } from "../crawler/homegate";
import { crawlFlatfox } from "../crawler/flatfox";

import { save } from "../utils/flats.utils";
import { successful } from "../utils/tasks.utils";

export async function watchTaskCreate(
  snapshot: DocumentSnapshot,
  context: EventContext
) {
  try {
    const taskId: string = context.params.taskId;

    if (!taskId || taskId === undefined || taskId === "") {
      return;
    }

    let elements: FlatData[] = [];

    const ronorpElements: FlatData[] | undefined = await crawlRonorp();
    if (ronorpElements !== undefined) {
      elements = [...ronorpElements];
    }

    const homegateElements: FlatData[] | undefined = await crawlHomegate();
    if (homegateElements !== undefined) {
      elements = [...elements, ...homegateElements];
    }

    const flatfoxElements: FlatData[] | undefined = await crawlFlatfox();
    if (flatfoxElements !== undefined) {
      elements = [...elements, ...flatfoxElements];
    }

    await save(elements);

    await successful(taskId);

    console.log(
      `Crawl done. ${
        ronorpElements ? ronorpElements.length : 0
      } elements found.`
    );
  } catch (err) {
    console.error(err);
  }
}
