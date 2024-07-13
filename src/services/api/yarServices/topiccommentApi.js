import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_DAYEYAR_BASE_URL };
const apiPath = "admin/topiccomment";
export default {
  list: async (data) => await axiosApi.post(`${apiPath}/paged`,data,url),
  add: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  delete: async (id) => await axiosApi.delete(`${apiPath}/${id}`,url),
};