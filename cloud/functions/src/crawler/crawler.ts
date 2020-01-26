import * as functions from 'firebase-functions';
import {Request} from 'firebase-functions/lib/providers/https';

import {crawlRonorp} from './ronorp';

import {FlatData} from '../model/flat';

import {save} from '../utils/flats.utils';

export async function crawlImmo(request: Request, response: any) {
    const isValidBearer: boolean = await validBearer(request);

    if (!isValidBearer) {
        response.status(400).json({error: 'Not Authorized'});
        return;
    }

    try {
        const elements: FlatData[] | undefined = await crawlRonorp();

        await save(elements);

        response.json({result: `Crawl done. ${elements ? elements.length : 0} elements found.`});
    } catch (err) {
        console.error(err);

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
