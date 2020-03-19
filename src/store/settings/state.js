import { LocalStorage } from 'quasar';

export const SETTINGS_KEY = 'sshbak-v1-settings';
export const defaultSettings = {
  host: '',
  port: 0,
  username: '',
  password: '',
  command: 'ls -l',
  backupFolder: '',
  dataFile: 'backup_files.txt',
  localPathname: '/tmp',
};

const storedSettings = LocalStorage.getItem(SETTINGS_KEY);

export default {
  remoteSettings: (!storedSettings) ? defaultSettings : storedSettings,
  ok: false,
};
