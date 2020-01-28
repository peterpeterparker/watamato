import {DocumentSnapshot} from 'firebase-functions/lib/providers/firestore';
import {EventContext} from 'firebase-functions';

import {FlatData} from '../model/flat';

import {crawlRonorp} from '../crawler/ronorp';

import {save} from '../utils/flats.utils';
import {successful} from '../utils/tasks.utils';

export async function watchTaskCreate(snapshot: DocumentSnapshot, context: EventContext) {
    try {
        const taskId: string = context.params.taskId;

        if (!taskId || taskId === undefined || taskId === '') {
            return;
        }

        const elements: FlatData[] | undefined = await crawlRonorp();

        await save(elements);

        await successful(taskId);

        console.log(`Crawl done. ${elements ? elements.length : 0} elements found.`);
    } catch (err) {
        console.error(err);
    }
}
