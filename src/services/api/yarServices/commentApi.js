import axiosApi from "@/services/axios-api.js"
const url = { baseURL: import.meta.env.VITE_DAYEYAR_BASE_URL };
const apiPath = "/admin/comments";
export default {
  getAll: async (data) => await axiosApi.post(`${apiPath}/list` , data , url),
  getTargetName: async (targetId,targetType) => await axiosApi.post(`${apiPath}/comment-details` , {targetId,targetType} , url),
};
