/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

import Vue3Toastify, { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';


// Plugins
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'



export function registerPlugins (app) {
  app
    .use(vuetify, {
     rtl:true
    })
    .use(router)
    .use(pinia)
    .use(Vue3Toastify, { 
      dangerouslyHTMLString: true,
      // onOpen: () => console.log('opened'),
      // onClose: () => console.log('closed'),
      autoClose: 6000,
      // closeButton: SomeVNode, // CloseBtnType
      // type: toast.TYPE.INFO,
      hideProgressBar: false,
      position: toast.POSITION.TOP_RIGHT,
      pauseOnHover: true,
      // transition: MyCustomTransition,
      // progress: 0.8,
      rtl: true,
      theme: toast.THEME.COLORED
    });
  
}
