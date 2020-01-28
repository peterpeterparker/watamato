import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
const app: admin.app.App = admin.initializeApp();
app.firestore().settings({timestampsInSnapshots: true});

import {crawlImmo} from './crawler/crawler';
import {watchUserCreate} from './user/watch-user';
import {watchFlatCreate} from './flat/watch-flat';
import {watchTaskCreate} from './task/watch-task';

const runtimeOpts = {
    timeoutSeconds: 240,
    memory: <const> '1GB'
};

export const crawl = functions.https.onRequest(crawlImmo);

export const userCreate = functions.auth.user().onCreate(watchUserCreate);

export const flatCreate = functions.firestore.document('flats/{flatId}').onCreate(watchFlatCreate);

export const taskCreate = functions.runWith(runtimeOpts).firestore.document('tasks/{taskId}').onCreate(watchTaskCreate);
