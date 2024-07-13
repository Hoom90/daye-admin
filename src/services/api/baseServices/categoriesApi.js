import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_BASESERVICE_BASE_URL };
const apiPath = "admin/categories";
export default {
  list: async (data) => await axiosApi.post(`${apiPath}/list`,data , url),
  getAll: async (data) => await axiosApi.post(`${apiPath}/search`,data , url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  assign: async (data) => await axiosApi.post(`${apiPath}/assign-to-app`, data, url),
  deleteById: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
  parents: async (id) => await axiosApi.get(`${apiPath}/parents/${id}`,url),
};
