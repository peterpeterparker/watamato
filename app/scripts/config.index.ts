import {writeFile} from 'fs';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
   production: true,
   firebase: {
        apiKey: '${process.env.FIREBASE_API_KEY}',
        authDomain: 'watamato-app.firebaseapp.com',
        databaseURL: 'https://watamato-app.firebaseio.com',
        projectId: 'watamato-app',
        storageBucket: 'watamato-app.appspot.com',
        messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
        appId: '${process.env.FIREBASE_APP_ID}',
        measurementId: '${process.env.FIREBASE_MEASUREMENT_ID}'
    }
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
    if (err) return console.log(err);
});
