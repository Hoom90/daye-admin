<script setup>
import authApi from "@/services/api/identityServices/auth"
import loginWithMobile from '@/pages/auth/component/mobile.vue'
import condition from "./component/contracts"
import { userStore } from '@/stores/userStore.js';
import notification from "@/utils/notification";
const router = useRouter()
const route = useRoute()
const user = userStore()
const state = reactive({
    condition: condition.checkRegistration,
    hasPassword: false,
    newUser: false,
    captcha: {},
    timeleft: 121,
    loading:false,
})

onMounted(()=>{
    if(user.getAuth) router.push('/dashboard')
})

async function checkRegistration(mobile) {
    state.loading=true
    // if(mobile == 'admin'){
    //     state.condition = condition.loginWithSMS
    //     loginWthSms({
    //     "mobile": "admin",
    //     "smsToken": "string"
    //     })
    //     return
    // }
    await authApi.post.checkUserRegistration({ mobile: mobile })
        .then((res) => {
            state.hasPassword = res.data.hasPassword
            state.newUser = res.data.newUser
            if (res.data.hasPassword)
                state.condition = condition.loginWithPassword
            else {
                state.condition = condition.loginWithSMS
                smsTimer()
            }
            getCaptcha()
        }).catch((err) => {
            notification.apiError(err?.data?.messages)
        });
        state.loading=false
}

const getCaptcha = () => {
    state.captcha.image=null
    authApi.get.captcha()
        .then(res => {
            state.captcha.image = res.data.image
            state.captcha.token = res.data.token
        })
        .catch(err => {
            notification.apiError(err?.data?.messages)
        })
}

const loginWithPass = async (data) => {
    state.loading=true
    await authApi.post.loginWithPass(
        {
            mobile: data.mobile,
            password: data.password,
            captchaCode: data.captchaCode,
            captchaToken: state.captcha.token,
        }).then((res) => {
            acceptLogin(res.data.token)
        }).catch((err) => {
            notification.apiError(err?.data?.messages)
            reloadCaptcha()
        });
        state.loading=false
}

const loginWthSms = async (data) => {
    state.loading=true
    await authApi.post.loginWithSms(
        {
            mobile: data.mobile,
            smsToken: data.smsToken,
        }).then((res) => {
            acceptLogin(res.data.token)
        }).catch((err) => {
            notification.apiError(err?.data?.messages)
        });
        state.loading=false
}

const acceptLogin = async (token) => {
    localStorage.setItem('token', token)
    user.setAuth(token)
    //getUserInfo()
    await localStorage.getUserInfo()
    notification.apiError('خوش آمدید!')
    const returnUrl = route.query.returnUrl
    if (returnUrl)
        router.replace(returnUrl)
    else router.push('/dashboard')
    // window.location.href=re
}

// const getUserInfo = async () =>
//     await accountApi.get.getUserInfo().then(r => {
//         localStorage.saveUser(r.data)
//     }).catch(e => {
//         notification.apiError(e.data?.messages)
//     }).finally(() => {

//     })


const reset = () => {
    state.condition = condition.checkRegistration
    state.hasPassword = false
    state.newUser = false
}

const sendSms = async (mobile) => {
    state.condition = condition.loginWithSMS
    await authApi.post.sendLoginSms({ mobile: mobile })
        .then((res) => {
            state.timeleft = 121
            smsTimer()
        }).catch((err) => {
            notification.apiError(err?.data?.messages)
        });
}

const loginWithPassword = () =>
    state.condition = condition.loginWithPassword


const smsTimer = () => {
    var newSmsTimer = setInterval(function () {
        state.timeleft--;
        if (state.timeleft <= 0)
            clearInterval(newSmsTimer);
    }, 1000);
}

const setCookie = () =>
    cookieManager.setCookie('a', 'b')

const getCookie = () => {
    let aa = cookieManager.getCookie('a')
    alert(aa)
}

const deleteCookie = () =>
    cookieManager.removeCookie('a')


</script>

<template>
    <!-- <v-btn @click="setCookie">set</v-btn>
    <v-btn @click="getCookie">get</v-btn>
    <v-btn @click="deleteCookie">del</v-btn> -->
    <!-- aa{{ state.condition }} -->
    <v-main class="d-flex justify-center align-center">
        <login-with-mobile :condition="state.condition" :hasPassword="state.hasPassword"
                    :newUser="state.hasPassword" :captchaImage="state.captcha.image"
                    @checkRegistration="checkRegistration" @reloadCaptcha="getCaptcha" @loginWithPass="loginWithPass"
                    @loginWthSms="loginWthSms" @reset="reset" @loginWithPassword="loginWithPassword" @sendSms="sendSms"
                    :timer="state.timeleft" :loading="state.loading" />
        <!-- <responsive-view>
            <template #mobile>
                <login-with-mobile :condition="state.condition" :hasPassword="state.hasPassword"
                    :newUser="state.hasPassword" :captchaImage="state.captcha.image"
                    @checkRegistration="checkRegistration" @reloadCaptcha="getCaptcha" @loginWithPass="loginWithPass"
                    @loginWthSms="loginWthSms" @reset="reset" @loginWithPassword="loginWithPassword" @sendSms="sendSms"
                    :timer="state.timeleft" />
            </template>

            <template #desktop>
                <login-with-desktop :condition="state.condition" :hasPassword="state.hasPassword"
                    :newUser="state.hasPassword" :captchaImage="state.captcha.image"
                    @checkRegistration="checkRegistration" @reloadCaptcha="getCaptcha" @loginWithPass="loginWithPass"
                    @loginWthSms="loginWthSms" @reset="reset" />
            </template>
        </responsive-view> -->
    </v-main>
</template>