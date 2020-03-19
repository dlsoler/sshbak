import {
  app, BrowserWindow, ipcMain,
} from 'electron';

import { Client } from 'ssh2';
import fs from 'fs';
import util from 'util';
import path from 'path';

import {
  CLIENT_CONNECT_START_EVENT, CLIENT_CONNECT_READY_EVENT, CLIENT_CONNECT_ERROR_EVENT,
  CLIENT_DISCONNECT_START_EVENT, CLIENT_DISCONNECT_END_EVENT,
  CLIENT_COMMAND_START_EVENT, CLIENT_COMMAND_END_EVENT, CLIENT_COMMAND_ERROR_EVENT,
  CLIENT_COMMAND_DATA_EVENT, CLIENT_COMMAND_ERROR_MSG_EVENT,
  CLIENT_SFTP_COMMAND_START_EVENT, CLIENT_SFTP_COMMAND_END_EVENT, CLIENT_SFTP_COMMAND_ERROR_EVENT,
  CLIENT_SFTP_COMMAND_PROGRESS_EVENT,
} from '../lib/app_events';

// eslint-disable-next-line global-require
if (require('electron-squirrel-startup')) app.quit();

// eslint-disable-next-line consistent-return,func-names
const handleStartupEvent = function () {
  if (process.platform !== 'win32' || process.argv.length === 1) {
    return false;
  }

  // eslint-disable-next-line global-require
  const ChildProcess = require('child_process');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  // eslint-disable-next-line func-names
  const spawn = function (command, args) {
    let spawnedProcess;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, { detached: true });
    } catch (error) {
      console.error(error);
    }

    return spawnedProcess;
  };

  // eslint-disable-next-line func-names
  const spawnUpdate = function (args) {
    return spawn(updateDotExe, args);
  };

  const squirrelCommand = process.argv[1];
  // eslint-disable-next-line default-case
  switch (squirrelCommand) {
    case '--squirrel-install':
    case '--squirrel-updated':

      // Optionally do things such as:
      //
      // - Install desktop and start menu shortcuts
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated
      app.quit();
      return true;
  }
};

if (handleStartupEvent()) {
  console.log('True');
}

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
  // eslint-disable-next-line no-underscore-dangle,global-require
  global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\');
}


let mainWindow;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 760,
    useContentSize: true,
    frame: false,
  });

  mainWindow.loadURL(process.env.APP_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

const conn = new Client();

ipcMain.on(CLIENT_CONNECT_START_EVENT, (event, connectOptions) => {
  conn.on('ready', () => {
    event.sender.send(CLIENT_CONNECT_READY_EVENT);
  })
    .on('error', (err) => {
      event.sender.send(CLIENT_CONNECT_ERROR_EVENT, err);
    })
    .connect(connectOptions);
});

ipcMain.on(CLIENT_DISCONNECT_START_EVENT, (event) => {
  conn.end();
  event.sender.send(CLIENT_DISCONNECT_END_EVENT);
});

ipcMain.on(CLIENT_COMMAND_START_EVENT, (event, command) => {
  conn.exec(command, (err, stream) => {
    if (err) {
      event.sender.send(CLIENT_COMMAND_ERROR_EVENT, err);
      return;
    }
    stream.on('close', (code, signal) => {
      event.sender.send(CLIENT_COMMAND_END_EVENT, { code, signal });
    }).on('data', (data) => {
      event.sender.send(CLIENT_COMMAND_DATA_EVENT, data);
    }).stderr.on('data', (data) => {
      event.sender.send(CLIENT_COMMAND_ERROR_MSG_EVENT, data);
    });
  });
});

function getFastGetFunc(sftp, sender) {
  // eslint-disable-next-line func-names
  return function (remotePathname, localPathname) {
    return new Promise((resolve, reject) => {
      sftp.fastGet(
        remotePathname,
        localPathname,
        {
          step(totalTransferred, chunk, total) {
            sender.send(
              CLIENT_SFTP_COMMAND_PROGRESS_EVENT,
              {
                remotePathname,
                localPathname,
                totalTransferred,
                total,
              },
            );
          },
        },
        (fastGetError) => {
          if (fastGetError) {
            return reject(fastGetError);
          }
          return resolve();
        },
      );
    });
  };
}

function getFilenames(pathname) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathname, (readFileError, data) => {
      if (readFileError) {
        console.error('Error reading data file', readFileError);
        return reject(readFileError);
      }
      const textDecoder = new util.TextDecoder('utf-8');
      const filenames = textDecoder.decode(data);
      const filenamesArray = filenames.split('\n').filter(filename => filename.length > 0);
      return resolve(filenamesArray);
    });
  });
}

ipcMain.on(CLIENT_SFTP_COMMAND_START_EVENT, (event, payload) => {
  // Get the sftp
  conn.sftp((err, sftp) => {
    if (err) {
      console.error('sftp error', err);
      event.sender.send(CLIENT_SFTP_COMMAND_ERROR_EVENT, err);
      return;
    }

    const fastGet = getFastGetFunc(sftp, event.sender);

    console.log('fastGet args:', payload);
    console.log('fastGet starts...');
    // Copy from remote pathname to local pathname
    fastGet(payload.remotePathname, payload.localPathname)
      .then(() => {
        console.log('fastGetOk!');
        return getFilenames(payload.localPathname);
      })
      .then((filenamesArray) => {
        // Array of promises to wait the downloads
        const promises = [];
        for (let i = 0; i < filenamesArray.length; i += 1) {
          // Get the filename from the full path of the file to dowload
          const filename = path.basename(filenamesArray[i]);
          // Get the directory from the local path
          const directory = path.dirname(payload.localPathname);
          // Create a new pathname with the previous values: local directory + remote filename
          const localPathname = `${directory}/${filename}`;
          console.log(`Starts dowloading from ${filenamesArray[i]} to ${localPathname}`);
          // Starts the download
          promises.push(fastGet(filenamesArray[i], localPathname));
        }
        // The promise will be resolved when all download are finished
        return Promise.all(promises).then(() => filenamesArray);
        // const remotePathname = filenamesArray[0];
        // const filename = path.basename(remotePathname);
        // const dir = path.dirname(payload.localPathname);
        // const localPathname = `${dir}/${filename}`;
        // return fastGet(remotePathname, localPathname)
        //   .then(() => filenamesArray);
      })
      .then((filenamesArray) => {
        console.log('Filenames array', filenamesArray);
        // The fast get finished without problems
        event.sender.send(CLIENT_SFTP_COMMAND_END_EVENT);
      })
      .catch((fastGetError) => {
        console.log('fastGet error:', fastGetError);
        // Something was wrong, there is an error
        event.sender.send(CLIENT_SFTP_COMMAND_ERROR_EVENT, fastGetError);
      });
  });
});
