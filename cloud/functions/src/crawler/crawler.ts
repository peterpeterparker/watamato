import * as functions from 'firebase-functions';
import {Request} from 'firebase-functions/lib/providers/https';

import {isScheduled, schedule} from '../utils/tasks.utils';

export async function crawlImmo(request: Request, response: any) {
    const isValidBearer: boolean = await validBearer(request);

    if (!isValidBearer) {
        response.status(400).json({error: 'Not Authorized'});
        return;
    }

    try {
        const scheduled: boolean = await isScheduled();

        if (!scheduled) {
            await schedule();
        }

        response.json({result: `Crawl scheduled.`});
    } catch (err) {
        response.status(500).json({error: err});
    }
}

function validBearer(request: Request) {
    return new Promise<boolean>((resolve) => {
        const key: string = functions.config().auth.key;

        const authorization: string | undefined = request.get('Authorization');
        const split: string[] = authorization ? authorization.split('Bearer ') : [];
        const bearerKey: string | undefined = split && split.length >= 2 ? split[1] : undefined;

        resolve(key === bearerKey);
    });
}
