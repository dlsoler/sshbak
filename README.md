## SSH Backup application (Aplicación para hacer backup usando SSH).

[Clic aquí para leer el README original en español](./README_ES.md)

### Description

**sshback** is a simple aplicaction to backup some folders in remote hosts.

This application was developed using Javascript, [Vue.js](https://vuejs.org/), [Quasar Framework](https://quasar.dev/) and [Electron Framework](https://www.electronjs.org/). 

We have create it for internal use of some our customers, because they do not want to learn how to use the linux command line.

This application hides such command lines behind a simple HTML user interface.

Of course, if you prefer you can enhance the user interface, stylishing it simply changing HTML and CSS files and rebuilding the application.

The functioning is very simple:

1.    The application log in to the hosting using ssh.
2.    It runs a shell script in the remote host to create the backup files.
3.    It downloads the backup files to the local machine.

## Customized backup script

You can customize the backup changing the shell script that runs on the remote server.

You can found the shell script filename in the **sshbak** settings.

This shell script file contains the commands to be runned in the server to create the backup files in the remote backup folder.

**It is very important that the same shell script creates a text file with a list of files to be downloaded**. The file names have to be separated by new lines.
This text file is downloaded and readed by sshbak to know which files it should download from the remote host to the local machine.

## Importing settings

You can give to your users a string containing all the settings necessaries to work, so they can configure the application in a very simple way.

The string is a JSON object, ie:

```json
{"backupFolder": "/home/backupuser/sshbak/backups","command": "cd /home/backupuser/sshbak;./sshbak.sh","dataFile": "backup_files.txt","host": "myhost.com.ar","localPathname": "/home/mylocaluser/Backups/","password": "My_SSH_password","port": "12345","username": "backupuser"}
```

The user should copy this string and paste it in the text field that it is shown when press the button ***Import Settings** in the settings screen.

Do not forget to save this settings, please.

The settings are stored permanently in the *Local Storage* so they will be disponible to the next backup sessions.

## Settings

-  backupFolder: remote folder where the backup files will be created.

-  command: script file to be executed in the remote host to make the backup.

-  dataFile: file containing the list of file to be downloaded from remote host.

-  host: remote server.

-  localPathname: local directory path where the backup files will be downloaded from the remote host.

-  password: ssh user password.

-  port: ssh port.

-  username: ssh username.

