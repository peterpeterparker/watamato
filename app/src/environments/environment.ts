import {firebase} from './firebase.environment';

export const environment = {
    production: false,
    ...firebase
};
