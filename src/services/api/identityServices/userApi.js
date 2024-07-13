import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_IDENTITY_BASE_URL };
const apiPath = "admin/users";
export default {
    getAll: async (data) => await axiosApi.post(`${apiPath}`, data, url),
    getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
    edit: async (data) => await axiosApi.put(`${apiPath}`, data, url),
}