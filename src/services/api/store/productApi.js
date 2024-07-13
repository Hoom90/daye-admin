import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_STORE_BASE_URL };
const apiPath = "admin/product";
export default {
  list: async (data) => await axiosApi.post(`${apiPath}/paged`,data , url),
  listByCatId: async (catId) => await axiosApi.get(`${apiPath}/list/${catId}` , url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  delete: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
};