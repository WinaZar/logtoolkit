<template>
  <q-page class="flex justify-between items-start">
      <div class="row full-width">
        <div class="col q-pa-md">
          <div class="col-12">
            <h4>Settings</h4>
          </div>
          <div class="col-4">
            <q-form class="q-gutter-md">
              <q-input
                filled
                ref="serverAddress"
                label="Server address *"
                v-model="serverAddress"
                :rules="[val => !!val || '* Required']"
              />
              <q-input
                filled
                ref="sshUser"
                label="User *"
                v-model="sshUser"
                :rules="[val => !!val || '* Required']"
              />
              <q-input
                filled
                ref="sshPort"
                label="Port *"
                type="number"
                v-model="sshPort"
                :rules="[val => !!val || '* Required']"
              />
              <q-input
                filled
                label="Path to SSH key"
                hint="optional"
                v-model="sshKeyPass"
              />
              <q-input
                filled
                ref="pathToLogs"
                label="Path to logs *"
                v-model="pathToLogs"
                :rules="[val => !!val || '* Required']"
              />
              <q-btn @click="saveSettings" color="primary">Save</q-btn>
            </q-form>
          </div>
        </div>
        <div class="col q-pa-md">
          <div class="col-12">
            <h4>Search parameters</h4>
          </div>
          <div class="col-4">
            <q-form class="q-gutter-md">
              <q-input
                filled
                ref="logFilePattern"
                label="Log file pattern *"
                v-model="searchData.logFilePattern"
                :rules="[val => !!val || '* Required']"
              />
              <q-input
                filled
                ref="searchPattern"
                label="Search pattern *"
                v-model="searchData.searchPattern"
                :rules="[val => !!val || '* Required']"
              />
              <q-input
                filled
                label="grep options"
                v-model="searchData.grepOptions"
              />
              <q-btn-group class="margin_btn">
                <q-btn
                  @click="doSearch"
                  color="primary"
                  :disable="loading"
                >Search</q-btn>
                <q-btn
                  @click="getUniqueFileNames"
                  color="primary"
                  :disable="loading"
                >Unique file names</q-btn>
              </q-btn-group>
            </q-form>
            <q-spinner
              v-if="loading"
              color="primary"
              size="3em"
              :thickness="2"
            />
          </div>
        </div>
      </div>
      <div class="row full-width">
        <div class="col q-pa-md">
          <div class="col-12">
            <h4>Search results</h4>
          </div>
          <div class="col-12">
            <q-input
              filled
              type="textarea"
              v-model="searchResults"
              :readonly="true"
              :input-style="{overflowX: 'scroll', whiteSpace: 'pre', overflowWrap: 'normal', height: '300px'}"
            />
          </div>
        </div>
      </div>
  </q-page>
</template>

<script>
import { exec } from 'child_process'
import { mkdir, writeFile } from 'fs'
export default {
  name: 'LogSearch',
  data () {
    return {
      requiredFields: [
        'serverAddress',
        'sshUser',
        'sshPort',
        'pathToLogs',
        'logFilePattern',
        'searchPattern'
      ],
      searchData: {
        logFilePattern: '',
        searchPattern: '',
        grepOptions: ''
      },
      searchResults: '',
      loading: false
    }
  },
  computed: {
    serverAddress: {
      get () {
        return this.$store.state.settings.serverAddress
      },
      set (val) {
        this.$store.commit('settings/updateSettings', { name: 'serverAddress', value: val })
      }
    },
    sshUser: {
      get () {
        return this.$store.state.settings.sshUser
      },
      set (val) {
        this.$store.commit('settings/updateSettings', { name: 'sshUser', value: val })
      }
    },
    sshPort: {
      get () {
        return this.$store.state.settings.sshPort
      },
      set (val) {
        this.$store.commit('settings/updateSettings', { name: 'sshPort', value: val })
      }
    },
    sshKeyPass: {
      get () {
        return this.$store.state.settings.sshKeyPass
      },
      set (val) {
        this.$store.commit('settings/updateSettings', { name: 'sshKeyPass', value: val })
      }
    },
    pathToLogs: {
      get () {
        return this.$store.state.settings.pathToLogs
      },
      set (val) {
        this.$store.commit('settings/updateSettings', { name: 'pathToLogs', value: val })
      }
    }
  },
  methods: {
    createSSHCommand () {
      return `ssh ${this.sshKeyPass ? '-i' : ''} ${this.sshKeyPass} ${this.serverAddress}`
    },
    executeCommand (command) {
      this.loading = true
      exec(`${this.createSSHCommand()} "${command}"`, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
        if (error) {
          this.searchResults = error
        } else if (stderr) {
          this.searchResults = stderr
        } else {
          this.searchResults = stdout
        }
        this.loading = false
      })
    },
    validateRequiredFields () {
      let valid = true
      for (const field of this.requiredFields) {
        this.$refs[field].validate()
        if (this.$refs[field].hasError) {
          valid = false
        }
      }
      return valid
    },
    getUniqueFileNames () {
      const command = `cd ${this.pathToLogs} && ls | awk -F. '{print \\$1}' | uniq | xargs -I {} sh -c 'ls -tr | grep -m 1 {}'`
      this.executeCommand(command)
    },
    doSearch () {
      if (!this.validateRequiredFields()) {
        this.$q.notify('Invalid search data')
      }
      const command = `cd ${this.pathToLogs} && grep ${this.searchData.grepOptions} "${this.searchData.searchPattern}" ${this.searchData.logFilePattern}`
      this.executeCommand(command)
    },
    saveSettings () {
      mkdir(this.$store.state.configDirectory, { recursive: true }, (err) => {
        if (err) throw err
        writeFile(`${this.$store.state.configDirectory}/settings.json`, JSON.stringify(this.$store.state.settings), (err) => {
          if (err) throw err
          console.log('Settings saved')
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .margin_btn {
    margin-bottom: 1em
  }
</style>
