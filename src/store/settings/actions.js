import { LocalStorage } from 'quasar';

import { SETTINGS } from './mutations';
import { SETTINGS_KEY } from './state';

export const SET_SETTINGS = 'setSettings';


export default {
  [SET_SETTINGS]({ commit }, settings) {
    commit(SETTINGS, settings);
    LocalStorage.set(SETTINGS_KEY, settings);
  },
};
