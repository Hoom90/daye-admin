<script setup>
const emits = defineEmits(['change'])
import {useTheme} from "vuetify";
const theme = useTheme()
const darkMode = ref(false);
const toggleTheme = () => {
  theme.global.name.value = darkMode.value ? "dark" : "light";
}
</script>
<template>
  <v-app-bar :elevation="2" color="grey-darken-3" style="position: fixed;">
    <v-app-bar-nav-icon @click="emits('change')"></v-app-bar-nav-icon>
    <v-spacer></v-spacer>
    <v-switch
      true-icon="mdi-moon-waning-crescent"
      false-icon="mdi-theme-light-dark"
      color="warning"
      v-model="darkMode"
      @change="toggleTheme()"
      class="me-5 pt-5"
    ></v-switch>
<!--    <v-btn icon v-model="darkMode" @click="toggleTheme">
      <v-icon></v-icon>
    </v-btn>-->
    <v-btn icon>
      <v-icon>mdi-bell-alert-outline</v-icon>
    </v-btn>
    <v-btn icon>
      <v-icon>mdi-account-box-outline</v-icon>
    </v-btn>
  </v-app-bar>
</template>
