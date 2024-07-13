import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_STORE_BASE_URL };
const apiPath = "admin/tags";
export default {
  getByCatId: async (catId) => await axiosApi.get(`${apiPath}/${catId}`,url),
};