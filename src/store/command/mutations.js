export const CLIENT_CONNECT_START = 'clientConnectStart';
export const CLIENT_CONNECT_READY = 'clientConnectReady';
export const CLIENT_CONNECT_ERROR = 'clientConnectError';
export const CLIENT_DISCONNECT_START = 'clientDisconnectStart';
export const CLIENT_DISCONNECT_END = 'clientDisconnectEnd';
export const CLIENT_COMMAND_START = 'clientLsStartEvent';
export const CLIENT_COMMAND_END = 'clientLsEnd';
export const CLIENT_COMMAND_ERROR = 'clientLsError';
export const CLIENT_COMMAND_DATA = 'clientLsData';
export const CLIENT_COMMAND_ERROR_MSG = 'clientLsErrorMsg';
export const CLIENT_SFTP_START = 'clientSftpStart';
export const CLIENT_SFTP_END = 'clientSftpEnd';
export const CLIENT_SFTP_ERROR = 'clientSftpEnd';
export const CLIENT_SFTP_DATA = 'clientSftpData';
export const RESET_COMMAND_MODULE = 'resetCommandStore';


export default {
  [CLIENT_CONNECT_START](state) {
    state.waiting = true;
    state.connectionError = null;
  },
  [CLIENT_CONNECT_READY](state) {
    state.waiting = false;
    state.connectionReady = true;
    state.connectionError = null;
  },
  [CLIENT_CONNECT_ERROR](state, err) {
    state.waiting = false;
    state.connectionReady = false;
    state.connectionError = err;
  },
  [CLIENT_DISCONNECT_START](state) {
    state.waiting = true;
    state.connectionError = null;
  },
  [CLIENT_DISCONNECT_END](state) {
    state.waiting = false;
    state.connectionReady = false;
  },
  [CLIENT_COMMAND_START](state) {
    state.waiting = true;
    state.data = '';
    state.stdError = null;
  },
  [CLIENT_COMMAND_END](state, payload) {
    state.waiting = false;
    state.code = payload.code;
    state.signal = payload.signal;
  },
  [CLIENT_COMMAND_ERROR](state, error) {
    state.waiting = false;
    state.error = error;
  },
  [CLIENT_COMMAND_DATA](state, data) {
    state.data += data;
  },
  [CLIENT_COMMAND_ERROR_MSG](state, message) {
    state.stdError = message;
  },
  [CLIENT_SFTP_START](state, payload) {
    state.waiting = true;
    state.data = '';
    state.remotePathname = payload.remotePathname;
    state.localPathname = payload.localPathname;
    state.progress = {};
    state.sftError = null;
  },
  [CLIENT_SFTP_END](state) {
    state.waiting = false;
    state.sftError = null;
  },
  [CLIENT_SFTP_ERROR](state, error) {
    state.waiting = false;
    state.sftError = error;
  },
  [CLIENT_SFTP_DATA](state, data) {
    const progress = Math.round(100 * data.totalTransferred / data.total) / 100;
    // Important: for reactivity we have to use object spread syntax or Vue.set(...)
    state.progress = { ...state.progress, [data.remotePathname]: progress };
  },
  [RESET_COMMAND_MODULE](state) {
    state.waiting = false;
    state.connectionReady = false;
    state.connectionError = null;
    state.commandError = null;
    state.data = '';
    state.stdError = null;
    state.code = null;
    state.signal = null;
    state.error = null;
    state.remotePathname = null;
    state.localPathname = null;
    state.sftError = null;
    state.progress = {};
  },
};
