import { ipcRenderer } from 'electron';

import {
  CLIENT_CONNECT_START_EVENT, CLIENT_CONNECT_READY_EVENT, CLIENT_CONNECT_ERROR_EVENT,
  CLIENT_DISCONNECT_START_EVENT, CLIENT_DISCONNECT_END_EVENT,
  CLIENT_COMMAND_START_EVENT, CLIENT_COMMAND_END_EVENT, CLIENT_COMMAND_ERROR_EVENT,
  CLIENT_COMMAND_DATA_EVENT, CLIENT_COMMAND_ERROR_MSG_EVENT,
  CLIENT_SFTP_COMMAND_START_EVENT, CLIENT_SFTP_COMMAND_END_EVENT, CLIENT_SFTP_COMMAND_ERROR_EVENT,
  CLIENT_SFTP_COMMAND_PROGRESS_EVENT,
} from '../../../src-electron/lib/app_events';

import {
  CLIENT_CONNECT_START, CLIENT_CONNECT_READY, CLIENT_CONNECT_ERROR,
  CLIENT_DISCONNECT_START, CLIENT_DISCONNECT_END,
  CLIENT_COMMAND_START, CLIENT_COMMAND_END, CLIENT_COMMAND_ERROR,
  CLIENT_COMMAND_DATA, CLIENT_COMMAND_ERROR_MSG,
  CLIENT_SFTP_START, CLIENT_SFTP_END, CLIENT_SFTP_ERROR, CLIENT_SFTP_DATA,
} from './mutations';

export const CONNECT = 'connect';
export const DISCONNECT = 'disconnect';
export const COMMAND = 'command';
export const DOWNLOAD = 'download';

export default {
  [CONNECT]({ commit }) {
    commit(CLIENT_CONNECT_START);
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      ipcRenderer.on(CLIENT_CONNECT_READY_EVENT, (event, arg) => {
        commit(CLIENT_CONNECT_READY);
        return resolve(true);
      });
      ipcRenderer.on(CLIENT_CONNECT_ERROR_EVENT, (event, err) => {
        commit(CLIENT_CONNECT_ERROR, err);
        return reject(err);
      });
      const connectOptions = this.state.settings.remoteSettings;
      ipcRenderer.send(CLIENT_CONNECT_START_EVENT, connectOptions);
    });
  },
  [DISCONNECT]({ commit }, payload) { // eslint-disable-line no-unused-vars
    commit(CLIENT_DISCONNECT_START);
    return new Promise((resolve, reject) => { // eslint-disable-line no-unused-vars
      // eslint-disable-next-line no-unused-vars
      ipcRenderer.on(CLIENT_DISCONNECT_END_EVENT, (event, arg) => {
        commit(CLIENT_DISCONNECT_END);
        return resolve(true);
      });
      ipcRenderer.send(CLIENT_DISCONNECT_START_EVENT);
    });
  },
  [COMMAND]({ commit }, command) {
    commit(CLIENT_COMMAND_START);
    return new Promise((resolve, reject) => {
      ipcRenderer.on(CLIENT_COMMAND_END_EVENT, (event, arg) => {
        if (arg.code === 0) {
          commit(CLIENT_COMMAND_END, arg);
          resolve(true);
        } else {
          const err = new Error(`Code: ${arg.code}. Signal: ${arg.signal}`);
          commit(CLIENT_COMMAND_ERROR, err);
          reject(err);
        }
      });
      ipcRenderer.on(CLIENT_COMMAND_ERROR_EVENT, (event, err) => {
        commit(CLIENT_COMMAND_ERROR, err);
        return reject(err);
      });
      ipcRenderer.on(CLIENT_COMMAND_DATA_EVENT, (event, data) => {
        const decodedData = new TextDecoder('utf-8').decode(data);
        console.log('LS DATA', decodedData);
        commit(CLIENT_COMMAND_DATA, decodedData);
      });
      ipcRenderer.on(CLIENT_COMMAND_ERROR_MSG_EVENT, (event, data) => {
        const decodedData = new TextDecoder('utf-8').decode(data);
        console.log('LS ERROR MSG', decodedData);
        commit(CLIENT_COMMAND_ERROR_MSG, decodedData);
      });
      ipcRenderer.send(CLIENT_COMMAND_START_EVENT, command);
    });
  },
  [DOWNLOAD]({ commit }, payload) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line no-unused-vars
      ipcRenderer.on(CLIENT_SFTP_COMMAND_END_EVENT, (event, arg) => {
        console.log('Client SFTP End Ok!');
        commit(CLIENT_SFTP_END);
        resolve(true);
      });
      ipcRenderer.on(CLIENT_SFTP_COMMAND_ERROR_EVENT, (event, err) => {
        console.error('Client SFTP Error:', err);
        commit(CLIENT_SFTP_ERROR, err);
        return reject(err);
      });
      ipcRenderer.on(CLIENT_SFTP_COMMAND_PROGRESS_EVENT, (event, arg) => {
        commit(CLIENT_SFTP_DATA, arg);
      });
      console.log('Client SFTP starts...', payload);
      commit(CLIENT_SFTP_START, payload);
      ipcRenderer.send(CLIENT_SFTP_COMMAND_START_EVENT, payload);
    });
  },
};
