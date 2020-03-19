import { defaultSettings } from './state';

export const SETTINGS = 'settings';

export default {
  [SETTINGS](state, settings) {
    if (!settings) {
      state.remoteSettings = defaultSettings;
    } else {
      const remoteSettings = Object.assign({}, settings);
      state.remoteSettings = remoteSettings;
    }
    state.ok = true;
  },
};
