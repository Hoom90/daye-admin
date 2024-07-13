import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_BASESERVICE_BASE_URL };
const apiPath = "admin/app";
export default {
  getAll: async () => await axiosApi.get(`${apiPath}`, url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  deleteById: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
};
