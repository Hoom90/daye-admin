import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_BASESERVICE_BASE_URL };
const apiPath = "admin/tags";
export default {
  getAll: async (data) => await axiosApi.post(`${apiPath}/paged`, data, url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  getAllById: async (id) => await axiosApi.post(`${apiPath}/get-tags`, url),
  getAllByAppCatId: async (id) => await axiosApi.post(`${apiPath}/by-app-category`, data, url),
  delete: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  assignToCategory: async (data) => await axiosApi.post(`${apiPath}/assign-tags-to-categories`,data,url),
};
