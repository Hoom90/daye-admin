import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_IDENTITY_BASE_URL };
const apiPath = "account";
export default {
  get: {
    getUserInfo: async () => await axiosApi.get(`${apiPath}/user-info`, url),
    getUserMeta: async () => await axiosApi.get(`${apiPath}/user-meta`, url),
  },
  post: {
    addUserMeta: async (data) => await axiosApi.post(`${apiPath}/user-meta`, data, url),
  },
};
