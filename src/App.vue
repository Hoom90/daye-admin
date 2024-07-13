<script setup>
import "@/composables/stringUtilities"
import { useDisplay } from 'vuetify'
import { userStore } from './stores/userStore';
import { useRouter } from 'vue-router';
const { mobile } = useDisplay()
const user = userStore()
const router = useRouter()
onMounted(()=>{
  let token = window.localStorage.getItem('token')
  if(token) user.setAuth(token)
  if(!user.getAuth){
    router.push('/auth')
  }
})

</script>
<template>
  <v-app>
    <v-locale-provider rtl>
        <router-view v-if="!mobile"/>
        <p class="style" v-else>لطفا از تبلت یا رایانه شخصی استفاده کنید.</p>
    </v-locale-provider>
  </v-app>
</template>
<style scoped>
.style{
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #666;
}
</style>
<style>
.shadow{
  box-shadow: 0 3px 3px #aaa;
}
.v-application{
  background: #EEE;
}
</style>
