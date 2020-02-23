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
    await successful(taskId);

    await crawlWithoutLogin();

    await crawlWithLogin();
  } catch (err) {
    console.error(err);

    try {
      await failure(taskId);
    } catch (errDb) {
      console.error(errDb);
    }
  }
}

async function crawlWithoutLogin() {
  let elements: FlatData[] = [];

  try {
    const homegateElements: FlatData[] | undefined = await crawlHomegate();

    if (homegateElements !== undefined) {
      elements = [...homegateElements];
    }
  } catch (err) {
    console.error("Homegate err", err);
  }

  try {
    const flatfoxElements: FlatData[] | undefined = await crawlFlatfox();

    if (flatfoxElements !== undefined) {
      elements = [...elements, ...flatfoxElements];
    }
  } catch (err) {
    console.error("Flatfox err", err);
  }

  await save(elements);

  console.log(
    `Crawl without login done. ${
      elements ? elements.length : 0
    } elements found.`
  );
}

async function crawlWithLogin() {
  let elements: FlatData[] = [];

  try {
    const ronorpElements: FlatData[] | undefined = await crawlRonorp();

    if (ronorpElements !== undefined) {
      elements = [...ronorpElements];
    }
  } catch (err) {
    console.error("Ronorp err", err);
  }

  await save(elements);

  console.log(
    `Crawl with login done. ${elements ? elements.length : 0} elements found.`
  );
}
