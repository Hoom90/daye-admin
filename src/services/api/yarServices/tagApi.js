import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_DAYEYAR_BASE_URL };
const apiPath = "admin/tags";
export default {
  byCatId: async (catId) => await axiosApi.get(`${apiPath}/${catId}`,url),
};