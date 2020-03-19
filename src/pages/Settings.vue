<template>
  <q-page padding>
    <div class="row">
      <div class="col-xs-12 q-pa-md">
        <div class="q-gutter-md">
          <q-input v-model="username" :label="$t('usernameLabel')" />
          <q-input v-model="password" type="password" :label="$t('passwordLabel')" />
          <q-input v-model="host" :label="$t('hostLabel')" />
          <q-input v-model="port" :label="$t('portLabel')" />
          <q-input v-model="command" :label="$t('commandLabel')" />
          <q-input v-model="backupFolder" :label="$t('backpFolderLabel')" />
          <q-input v-model="dataFile" :label="$t('dataFileLabel')" />
          <q-input v-model="localPathname" :label="$t('localPathnameLabel')" />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="q-pa-md">
        <div class="q-gutter-md">
          <q-btn :label="$t('save')" @click="handleSave" />
          <q-btn :label="$t('cancel')" to="/" />
          <q-btn :label="$t('importSettings')" @click="handleImportSettings" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { SET_SETTINGS } from '../store/settings/actions';
import { GET_SETTINGS } from '../store/settings/getters';

export default {
  name: 'SettingsPage',
  data() {
    return {
      host: '',
      port: 0,
      username: '',
      password: '',
      command: '',
      backupFolder: '',
      dataFile: 'backup_files.txt',
      localPathname: '/tmp',
    };
  },
  methods: {
    handleSave() {
      this.$store.dispatch(`settings/${SET_SETTINGS}`,
        {
          host: this.host,
          port: this.port,
          username: this.username,
          password: this.password,
          command: this.command,
          backupFolder: this.backupFolder,
          dataFile: this.dataFile,
          localPathname: this.localPathname,
        });
      this.$q.notify({
        message: this.$t('dataSaved'),
        color: 'primary',
        closeBtn: 'Ok',
      });
    },
    handleImportSettings() {
      this.$q.dialog({
        title: this.$t('newSettings'),
        message: this.$t('writeSettings'),
        prompt: {
          model: '',
          type: 'text', // optional
        },
        cancel: true,
        persistent: true,
      }).onOk((data) => {
        const json = data.trim();
        try {
          const settings = JSON.parse(json);
          this.host = settings.host;
          this.port = settings.port;
          this.username = settings.username;
          this.password = settings.password;
          this.command = settings.command;
          this.backupFolder = settings.backupFolder;
          this.dataFile = settings.dataFile;
          this.localPathname = settings.localPathname;
          this.$store.dispatch(`settings/${SET_SETTINGS}`, settings)
            .then(() => {
              this.$q.dialog({
                title: this.$t('infoDialogTitle'),
                message: this.$t('importSettingsOk'),
              });
            })
            .catch((err) => {
              this.$q.dialog({
                title: this.$t('infoDialogTitle'),
                message: this.$t('importSettingsError', err),
              });
            });
        } catch (e) {
          console.error('Error while importing settings: ', e);
          this.$q.dialog({
            title: this.$t('infoDialogTitle'),
            message: this.$t('importSettingsError', e),
          });
        }
      });
    },
  },
  mounted() {
    const data = this.$store.getters[`settings/${GET_SETTINGS}`];
    this.host = data.host;
    this.port = data.port;
    this.username = data.username;
    this.password = data.password;
    this.command = data.command;
    this.backupFolder = data.backupFolder;
    this.dataFile = data.dataFile;
    this.localPathname = data.localPathname;
  },
};
</script>

<style>
</style>
