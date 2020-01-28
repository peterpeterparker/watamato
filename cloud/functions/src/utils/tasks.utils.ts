import * as admin from 'firebase-admin';

import {TaskData} from '../model/tasks';

export function isScheduled(): Promise<boolean> {
    return new Promise<boolean>(async (resolve, reject) => {
        try {
           const collectionRef: admin.firestore.CollectionReference = admin.firestore().collection('/tasks/');

            const snapShot: admin.firestore.QuerySnapshot = await collectionRef
                .where('status', '==', 'scheduled')
                .get();

            resolve(snapShot && snapShot.docs && snapShot.docs.length > 0);
        } catch (err) {
            reject(err);
        }
    })
}

export function schedule(): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            const scheduledData: TaskData = {
                status: 'scheduled',
                created_at: admin.firestore.Timestamp.now(),
                updated_at: admin.firestore.Timestamp.now(),
            };

            const collectionRef: admin.firestore.CollectionReference = admin.firestore().collection('/tasks/');

            await collectionRef.add(scheduledData);

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

export function successful(taskId: string): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
        try {
            if (!taskId || taskId === undefined || !taskId) {
                resolve();
                return;
            }

            const documentReference: admin.firestore.DocumentReference = admin.firestore().doc(`/tasks/${taskId}/`);

            const updateTaskData: TaskData = {
                status: 'successful',
                updated_at: admin.firestore.Timestamp.now()
            };

            await documentReference.set(updateTaskData, {merge: true});

            resolve();
        } catch (err) {
            reject(err);
        }
    });
}
