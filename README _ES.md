## Aplicación para hacer respaldo usando SSH

### Descripción

**sshback** es una aplicación muy simple para hacer copia de seguridad de algunos directorios en servidores remotos usando SSH.

Esta aplicación fue desarrollada usando Javascript, [Vue.js](https://vuejs.org/), [Quasar Framework](https://quasar.dev/) y [Electron Framework](https://www.electronjs.org/). 


Hemos creado esta aplicación para uso interno de algunos de nuestros clientes porque ellos no quisieron aprender cómo usar la línea de comando de Linux.

Esta aplicación oculta la ejecución de los comandos tras una interfaz de usuario hecha en HTML.

Si lo prefiere, ustede puede mejorar la estética interfaz del usuario simplemente editando los archivos HTML y CSS y luego compilando la aplicación nuevamente. 

El funcionamiento de la aplicación es muy simple:

1.   La aplicación accede al servidor remoto usando SSH.
2.   Ejecuta un archivo de comandos shell para crear los archivos de respaldo.
3.   Descarga dichos archivos de respaldo a la computadora local


## Script de respaldo personalizado

Puede personalizar el respaldo cambiando el archvio de comandos que se ejecuta en el servidor remoto.

El nombre del archivo de comandos debe estar guardado en la configuración de sshbak.

El archivo de comandos contendrá los comandos a ser ejecutados en el servidor remoto para crear los archivos de respaldo adentro del directorio de respaldo.

** Es muy importante que el archivo de comandos para crear el respaldo también cree un archivo con la lista de los archivos de respaldo a ser descargados en la computadora local**. Los nombres de los archivos a descargarse tiene que estar separados, uno en cada línea de texto.
Este archivo de texto es descargado y leído por sshbak para conocer cuáles archivos este deberá descargar desde el servidor remoto.

En el directorio **shellscripts** encontrará algunos ejemplos de archivos de comandos.

## Importando una configuración 

Puede darle a sus clientes un texto conteniendo toda la configuración necesaria para que trabajen, entonces ellos podrán configura la aplicacion de una manera muy sencilla.

El texto debería ser una cadena con formato JSON, por ejemplo:

```json
{"backupFolder": "/home/backupuser/sshbak/backups","command": "cd /home/backupuser/sshbak;./sshbak.sh","dataFile": "backup_files.txt","host": "myhost.com.ar","localPathname": "/home/mylocaluser/Backups/","password": "My_SSH_password","port": "12345","username": "backupuser"}
```

Luego, el usuario copiará y pegará este texto en el campo que se muestra cuando presione el botón "Import settings" en la pantalla de "Settings"

Por favor, no olvide salvar la configuración antes de salir de ella.

La configuración es guardada permanentemente en el "Local Storage", entonces permanecerá disponible para futuras sesiones de respaldo.


## Configuración:

-  backupFolder: directorio remoto donde los archivos de respaldo serán almacenados.

-  command: archivo de comandos a ser ejecutado para hacer el backup.

-  dataFile: archivo de texto que contiene la lista de archivos a ser descargados desde el servidor remoto.

-  host: servidor remoto.

-  localPathname: directorio local donde se descargarán los archivos de respaldo.

-  password: contraseña del usuario ssh.

-  port: puerto ssh.

-  username: nombre del usuario ssh.

