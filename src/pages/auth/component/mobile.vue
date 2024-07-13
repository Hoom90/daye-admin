<script setup>
//import authApi from "@/services/api/e-commerce/auth.js"
//import swal from "~/plugins/swal";
import notification from "@/utils/notification";
import conditions from "./contracts"


const emit = defineEmits(['checkRegistration', 'reloadCaptcha', 'reset', 'loginWthSms', 'loginWithPassword', 'sendSms'])
const props = defineProps(['condition', 'hasPassword', 'newUser', 'captchaImage', 'timer', 'loading'])

const state = reactive({
  // loading: false,
})

const newUser = reactive({
  mobile: null,
  smsToken: null,
  password: null,
  captchaCode: null,
  captchaToken: null,
})

watch(() => props.hasPassword, (newValue, oldValue) => {
  state.loginWithPassword = newValue
})

const isRegistered = () => {
  if (!newUser.mobile) {
    notification.apiError("موبایل خود را وارد کنید")
    return
  }
  // state.loading = true;
  emit('checkRegistration', newUser.mobile)
}

const loginWithPass = () => {
  if (!newUser.password || !newUser.captchaCode) {
    notification.apiError("اطلاعات را کامل کنید")
    return
  }
  // state.loading = true;
  emit('loginWithPass', {
    password: newUser.password,
    captchaCode: newUser.captchaCode,
    mobile: newUser.mobile
  })
}

const loginWthSms = () => {
  if (!newUser.smsToken) {
    notification.apiError("اطلاعات را کامل کنید")
    return
  }
  // state.loading = true;
  emit('loginWthSms', {
    smsToken: newUser.smsToken,
    mobile: newUser.mobile
  })
}

const changeNumber = () => {
  emit('reset')
}

// watch(() => props.condition, () => {
//   state.loading = false;
// })

</script>

<template>
  <v-slide-x-transition class="position-absolute">
    <v-card elevation="3" v-show="props.condition == conditions.checkRegistration" width="380"
      class="rounded-lg overflow-visible mb-16">
      <!-- bb{{ props.condition }} -->

      <form @submit.prevent="isRegistered">
        <div class="L_logo">
          <img src="@/assets/img/1.png" width="80" />
        </div>
        <v-card-text class="pa-5">
          <v-text-field variant="outlined" label="شماره موبایل" v-model="newUser.mobile" autofocus>
            <template v-slot:append-inner>
              <span style="color: #aaa;">
                98+
              </span>
            </template>
          </v-text-field>
          <v-divider class="mb-5"></v-divider>
          <v-btn type="submit" block variant="elevated" color="info" size="x-large"
            :loading="props.loading">ورود</v-btn>
          <!-- <div class="pt-5">
          <small>
            <v-icon class="me-1">mdi-circle-medium</v-icon>
            <strong>ورود شما به معنای
              <v-btn to="/rules" variant="text" class="pa-0"> پذیرش قوانین دایه</v-btn>
              می باشد.</strong>
            </small>
          </div>
          <nuxt-link to="/" class="text-center d-block mt-4">بازگشت به صفحه اصلی</nuxt-link> -->
        </v-card-text>
      </form>
    </v-card>
  </v-slide-x-transition>

  <v-slide-x-reverse-transition class="position-absolute">
    <v-card elevation="3" v-show="props.condition == conditions.loginWithPassword" width="380"
      class="rounded-lg overflow-visible mb-16">
      <form @submit.prevent="loginWithPass">
        <div class="L_logo">
          <img src="@/assets/img/1.png" width="80" />
        </div>
        <div class="text-center mt-5">
          <small>({{ newUser.mobile }}) </small>
          <a href="javascript:void(0)" class="text-danger" @click="changeNumber">
            <small>تغییر شماره موبایل</small>
          </a>
        </div>
        <v-card-text class="pa-5">
          <v-text-field variant="outlined" type="password" label="ورود با کلمه عبور" v-model="newUser.password">
            <!-- <template #prepend-inner-icon>
            asasas
          </template> -->
          </v-text-field>
          <div >
            <v-skeleton-loader type="chip" v-if="!props.captchaImage" class="mx-auto"
              style="width:150px; "></v-skeleton-loader>
            <v-img v-else :src="`data:image/png;base64,${props.captchaImage ?? ''}`" style="width:150px"
              @click="emit('reloadCaptcha')" class="mx-auto"></v-img>
          </div>
          <v-text-field v-model="newUser.captchaCode" variant="outlined" label="متن تصویر"></v-text-field>
          <v-divider class="mb-5"></v-divider>
          <v-btn block variant="elevated" color="info" size="x-large" type="submit"
            :loading="props.loading">ادامه</v-btn>

          <div class="pt-5 text-center">
            <v-btn variant="text" color="dark" @click="emit('sendSms', newUser.mobile)">ورود با کد پیامکی</v-btn>
          </div>
        </v-card-text>
      </form>
    </v-card>
  </v-slide-x-reverse-transition>

  <v-slide-x-transition class="position-absolute">
    <v-card elevation="3" v-show="props.condition == conditions.loginWithSMS" width="380"
      class="rounded-lg overflow-visible mb-16">
      <div class="L_logo">
        <img src="@/assets/img/1.png" width="80" />
      </div>
      <div class="text-center mt-5">
        <small>({{ newUser.mobile }}) </small>
        <a href="javascript:void(0)" class="text-danger" @click="changeNumber">
          <small>تغییر شماره موبایل</small>
        </a>
      </div>
      <v-card-text class="pa-5">
        <v-text-field type="number" variant="outlined" label="ورود با کد تایید"
          v-model="newUser.smsToken"></v-text-field>
        <v-divider class="mb-5"></v-divider>
        <v-btn block variant="elevated" color="info" size="x-large" @click="loginWthSms"
          :loading="props.loading">تایید</v-btn>
        <div class="my-5 text-center">
          <div v-if="props.timer > 0">
            جهت درخواست مجدد پیامک باید
            {{ props.timer }}
            ثانیه صبر کنید
          </div>
          <v-btn v-else variant="text" color="dark" @click="emit('sendSms', newUser.mobile)">درخواست مجدد
            پیامک</v-btn>
        </div>
        <div class="pt-5 text-center">
          <v-btn variant="text" color="dark" v-if="props.hasPassword" @click="emit('loginWithPassword')">ورود با کلمه
            عبور</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-slide-x-transition>

</template>
<style scoped>
.L_logo {
  position: relative;
  width: 80px;
  height: 50px;
  margin: 0 auto;
  text-align: center;
}

.L_logo::before {
  content: "";
  width: 100px;
  height: 100px;
  background: white;
  position: absolute;
  top: -50px;
  left: -10px;
  border-radius: 100%;
  box-shadow: 0 -5px 5px #0000001c;
}

.L_logo img {
    width: 70px;
    margin-top: -25px;
    position: relative;
}
</style>