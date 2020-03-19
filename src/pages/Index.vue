<template>
  <q-page>
    <div class="row q-ma-md">
      <div class="col">
      </div>
      <div class="col-3">
        <img id="backup-img" src="~/assets/backup.jpg" />
      </div>
      <div class="col">
      </div>
    </div>
    <h3 id="log-title">{{ $t('logTitle') }}</h3>
    <div class="row q-ma-md">
      <div class="col"></div>
      <div class="col-8">
        <q-scroll-area
          :thumb-style="thumbStyle"
          :content-style="contentStyle"
          :content-active-style="contentActiveStyle"
          id="log-scroll-area"
        >
          <div v-for="(data, index) in getDataArray" :key="`key-${index}`" class="q-px-md">
            <span>{{ data }}</span>
          </div>
        </q-scroll-area>
      </div>
      <div class="col"></div>
    </div>

    <div v-for="obj in progress" :key="obj.pathname" class="q-ma-lg">
      <div  class="row q-ma-xs" >
        <div class="col-12">
          <div style="text-align: center;">{{ $t('filenameTitle')}}: {{ obj.pathname }}</div>
        </div>
      </div>
      <div class="row q-ma-xs">
        <div class="col"></div>
        <div class="col-8">
          <q-linear-progress style="height: 10px" :value="obj.progress" />
        </div>
        <div class="col"></div>
      </div>
      <div class="row q-ma-xs">
        <div class="col-12">
          <div style="text-align: center;">{{ obj.progress * 100 }} %</div>
        </div>
      </div>
    </div>

    <div class="row justify-center">
      <div class="q-pa-md">
        <div class="q-gutter-md">
          <q-btn color="primary" :label="$t('backup')" @click="handleCommand" />
          <q-btn color="primary" :label="$t('download')" @click="handleDownload" />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import {
  CONNECT, DISCONNECT, COMMAND, DOWNLOAD,
} from '../store/command/actions';
import { GET_DATA_ARRAY } from '../store/command/getters';
import { RESET_COMMAND_MODULE } from '../store/command/mutations';
import { GET_SETTINGS } from '../store/settings/getters';

export default {
  name: 'PageIndex',
  computed: {
    contentStyle() {
      return {
        backgroundColor: 'rgba(0,0,0,0.02)',
        color: '#555',
      };
    },
    contentActiveStyle() {
      return {
        backgroundColor: '#eee',
        color: 'black',
      };
    },
    thumbStyle() {
      return {
        right: '2px',
        borderRadius: '5px',
        backgroundColor: '#027be3',
        width: '5px',
        opacity: 0.75,
      };
    },
    getDataArray() {
      return this.$store.getters[`command/${GET_DATA_ARRAY}`];
    },
    filename() {
      return this.$store.state.command.remotePathname;
    },
    progress() {
      const progressObj = this.$store.state.command.progress;
      const keys = Object.keys(progressObj);
      if (keys.length === 0) {
        return [];
      }
      return keys.map(key => ({ pathname: key, progress: progressObj[key] }));
    },
  },
  methods: {
    handleCommand() {
      this.$store.commit(`command/${RESET_COMMAND_MODULE}`);
      this.$q.loading.show({ delay: 400 });
      const settings = this.$store.getters[`settings/${GET_SETTINGS}`];
      return this.$store.dispatch(`command/${CONNECT}`)
        .then(() => {
          console.log('Connect ok');
          return this.$store.dispatch(`command/${COMMAND}`, settings.command);
        })
        .then(() => {
          console.log('Command ok');
          return this.$store.dispatch(`command/${DISCONNECT}`);
        })
        .then(() => {
          console.log('Disconnect ok');
          this.$q.loading.hide();
          this.$q.dialog({
            title: this.$t('infoDialogTitle'),
            message: this.$t('successfulBackup'),
          });
        })
        .catch((err) => {
          this.$q.loading.hide();
          console.log('Error', err);
          this.$q.dialog({
            title: this.$t('errorDialogTitle'),
            message: this.$t('backupError', { error: err }),
          });
        });
    },
    handleDownload() {
      const settings = this.$store.getters[`settings/${GET_SETTINGS}`];
      const remotePathname = `${settings.backupFolder}/${settings.dataFile}`;
      const localPathname = `${settings.localPathname}/${settings.dataFile}`; // eslint-disable-line prefer-destructuring
      return this.$store.dispatch(`command/${CONNECT}`)
        .then(() => {
          console.log('Connect ok');
          console.log('Dowload', remotePathname, localPathname);
          return this.$store.dispatch(`command/${DOWNLOAD}`, { remotePathname, localPathname });
        })
        .then(() => {
          console.log('Download ok');
          return this.$store.dispatch(`command/${DISCONNECT}`);
        })
        .then(() => {
          console.log('Disconnect ok');
          this.$q.dialog({
            title: this.$t('infoDialogTitle'),
            message: this.$t('successfulDownload'),
          });
        })
        .catch((err) => {
          console.log('Error', err);
          this.$q.dialog({
            title: this.$t('errorDialogTitle'),
            message: this.$('downloadError', { error: err }),
          });
        });
    },
  },
};
</script>
<style>
#log-title {
  text-align: center;
  font-size: 2rem;
}
#backup-img {
  display: inline-block;
  width: 100%;
  height: auto;
}
#log-scroll-area{
  height: 10rem;
  border: 1px solid #c0c0c0;
}
</style>
