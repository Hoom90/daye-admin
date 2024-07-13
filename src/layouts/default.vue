<script setup>
import HeaderView from "./dashboard/headerView.vue";
import AsideView from "./dashboard/asideView.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard";
import { userStore } from "@/stores/userStore";
const breadCrumbs = dashboardbreadcrumbstore()
const user =userStore()
const state = reactive({
  showDrawer: true,
  windowHeight:500,
})

onMounted(() => {
  state.showDrawer = Boolean(localStorage.getItem('sidebar') ?? '1')
  state.windowHeight=window.innerHeight-65
})

const saveState = () => (localStorage.setItem('sidebar', state.showDrawer ? '1' : ''))

const changeDrawerState = () => {
  state.showDrawer = !state.showDrawer
  saveState()
}

</script>
<template>
  <v-layout v-if="user.getAuth" class="h-100">
    <AsideView v-model="state.showDrawer" @update:modelValue="saveState" />
    <v-main>
      <HeaderView @change="changeDrawerState"/>
      <section class="pa-5">
        <v-breadcrumbs :items="breadCrumbs.getBreadCrumbs" class="pt-1 pb-5">
          <template v-slot:divider>
            <v-icon icon="mdi-chevron-left"></v-icon>
          </template>
        </v-breadcrumbs>
        <router-view />
      </section>
    </v-main>
  </v-layout>
  <v-layout v-else class="h-100">
    <router-view />
  </v-layout>
</template>
<style scoped>
.max-width{
  max-width: 1200px;
  margin: auto;
}
</style>
