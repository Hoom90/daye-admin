import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_IDENTITY_BASE_URL };
const apiPath = "auth";
export default {
    post:{
        checkUserRegistration: async (data) => await axiosApi.post(`${apiPath}/check-user-registration`, data, url),
        loginWithPass: async (data) => await axiosApi.post(`${apiPath}/login-with-password`, data, url),
        sendLoginSms: async (data) => await axiosApi.post(`${apiPath}/send-login-sms`, data, url),
        loginWithSms: async (data) => await axiosApi.post(`${apiPath}/login-with-sms`, data, url),
        logOut: async (data) => await axiosApi.post(`${apiPath}/logout`, data, url),
    },

    get:{
        captcha: async () => await axiosApi.get(`${apiPath}/captcha`, url),
    },
}