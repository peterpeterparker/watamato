import {firebase} from './firebase.environment';

import packageInfo from '../../package.json';
const {name, version} = packageInfo;

export const environment = {
  production: false,
  ...firebase,
  name,
  version
};
