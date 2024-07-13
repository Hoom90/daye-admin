/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { VBtn } from 'vuetify/components/VBtn'

// Composables
import { createVuetify } from 'vuetify'


const light = {
  dark: false,
  colors: {
    background: '#EEE',
    surface: '#FFF',
    primary: '#6200EE',
    'primary-darken-1': '#3700B3',
    secondary: '#03DAC6',
    'secondary-darken-1': '#018786',
    error: '#B00020',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FB8C00',
    'theme-blue': '#428e9d',
    black: "#000",
  },
}
const dark = {
  dark: true,
  colors: {
    background: '#EEE',
    surface: '#46738b',
  },
}

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  // locale:{
  //   isRtl: true,
  // },
  theme: {
    defaultTheme: 'light',
    themes: {light},
  },
  display: {
    mobileBreakpoint: 'sm',
    thresholds: {
      sm: 576,
      md: 768,
      lg: 1100,
      xl: 1600,
    },
  },
  aliases: {
    VBtnPrimary: VBtn,
  },
  defaults: {
    global: {
      ripple: false,
    },
    VSheet: {
      elevation: 4,
    },
    VCard: {
      VBtn: { variant: 'outlined' },
    },
    VBtn: {
      style: 'text-transform: none;',
    },
  },

})
