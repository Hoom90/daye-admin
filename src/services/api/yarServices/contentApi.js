import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_DAYEYAR_BASE_URL };
const apiPath = "admin/content";
export default {
  paged: async (data) => await axiosApi.post(`${apiPath}/paged`,data,url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  delete: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
};