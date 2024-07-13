import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_STORE_BASE_URL };
const apiPath = "admin/AttributeValue";
export default {
  list: async (id) => await axiosApi.get(`${apiPath}/list/${id}`,url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  delete: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
};