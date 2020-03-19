export const GET_SETTINGS = 'getSettings';


export default {
  [GET_SETTINGS](state) {
    return state.remoteSettings;
  },
};
