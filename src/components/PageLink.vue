<template>
  <q-item
    clickable
    tag="a"
    @click="$route.name != page ? $router.push({'name': page}) : $q.notify('Already here')"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'PageLink',
  props: {
    title: {
      type: String,
      required: true
    },

    page: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
