import {firebase} from './firebase.environment';
import {name, version} from '../../package.json';

export const environment = {
  production: false,
  ...firebase,
  name,
  version
};
