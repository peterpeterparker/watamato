import {firestore} from 'firebase-admin';

interface TaskData {
    status: 'scheduled' | 'failed' | 'successful';

    created_at?: firestore.Timestamp;
    updated_at?: firestore.Timestamp;
}

interface Task {
    id: string;
    ref: firestore.DocumentReference;

    data: TaskData;
}
