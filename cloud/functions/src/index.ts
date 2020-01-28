import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
const app: admin.app.App = admin.initializeApp();
app.firestore().settings({timestampsInSnapshots: true});

import {crawlImmo} from './crawler/crawler';
import {watchUserCreate} from './user/watch-user';
import {watchFlatCreate} from './flat/watch-flat';

const runtimeOpts = {
    timeoutSeconds: 240,
    memory: <const> '1GB'
};

export const crawl = functions.runWith(runtimeOpts).https.onRequest(crawlImmo);

export const userCreate = functions.auth.user().onCreate(watchUserCreate);

export const flatCreate = functions.firestore.document('flats/{flatId}').onCreate(watchFlatCreate);
