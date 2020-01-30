import {writeFile} from 'fs';
import {name, version} from '../package.json';

const targetPath = './src/environments/environment.prod.ts';

const envConfigFile = `export const environment = {
   production: true,
   firebase: {
        apiKey: '${process.env.FIREBASE_API_KEY}',
        authDomain: 'watamato-app.firebaseapp.com',
        databaseURL: 'https://watamato-app.firebaseio.com',
        projectId: 'watamato-app',
        storageBucket: 'watamato-app.appspot.com',
        messagingSenderId: '186771088317',
        appId: '1:186771088317:web:431aec6d0cade214d4e8d4',
        measurementId: 'G-XY72KL25LS'
    },
    name: '${name}',
    version: '${version}'
};
`;

writeFile(targetPath, envConfigFile, 'utf8', (err) => {
  if (err) return console.log(err);
});
