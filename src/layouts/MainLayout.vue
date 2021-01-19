<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Log Search App
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Pages
        </q-item-label>
        <PageLink
          v-for="link in pageLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { readFile } from 'fs'
import PageLink from 'components/PageLink.vue'

const pageData = [
  {
    title: 'Index',
    icon: 'home',
    page: 'LogSearch'
  }
]

export default {
  name: 'MainLayout',
  components: { PageLink },
  data () {
    return {
      leftDrawerOpen: false,
      pageLinks: pageData
    }
  },
  methods: {
    loadSettings () {
      readFile(`${this.$store.state.configDirectory}/settings.json`, (err, data) => {
        if (err) {
          if (err.message.indexOf('no such file or directory') === -1) {
            throw err
          }
          return
        }
        for (const [key, value] of Object.entries(JSON.parse(data))) {
          this.$store.commit('settings/updateSettings', { name: key, value: value })
        }
      })
    }
  },
  created () {
    this.loadSettings()
  }
}
</script>
