import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_BASESERVICE_BASE_URL };
const apiPath = "appCategory";
export default {
  getAll: async (id) => await axiosApi.get(`${apiPath}?AppId=${id}`, url),
  assignToApp: async (data) => await axiosApi.post(`admin/${apiPath}/assign-to-app`, data, url),
};
