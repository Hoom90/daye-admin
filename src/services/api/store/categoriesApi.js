import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_STORE_BASE_URL };
const apiPath = "/categories";
export default {
  getAll: async () => await axiosApi.get(`${apiPath}/flat` , url),
};
