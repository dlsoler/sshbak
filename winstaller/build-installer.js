const electronInstaller = require('electron-winstaller');
const path = require('path');


const resultPromise = electronInstaller.createWindowsInstaller({
  appDirectory: path(__dirname, '../dist/electron/sshbak-win32-x64'),
  outputDirectory: path(__dirname, '../dist/electron/sshbak-win32-x64-installer'),
  authors: 'Diego Soler',
  exe: 'sshbak.exe',
  setupExe: 'setup.exe',
});

resultPromise.then(
  () => console.log('It worked!'),
  e => console.log(`Error: ${e.message}`),
);
