// Will be overwritten by build

import {firebase} from './firebase.environment';

export const environment = {
    production: true,
    ...firebase
};
