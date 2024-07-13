import axiosApi from "@/services/axios-api.js"
import storeCommentApi from "../store/commentApi";
import yarCommentApi from "../yarServices/commentApi";
import notification from "@/utils/notification.js"
const url = { baseURL: import.meta.env.VITE_BASESERVICE_BASE_URL };
const apiPath = "admin/comments";
export default {
  getAll: async (data) => await axiosApi.post(`${apiPath}/search`, data, url),
  getById: async (id) => await axiosApi.get(`${apiPath}/${id}`, url),
  addComment: async (data) => await axiosApi.post(`${apiPath}`, data, url),
  editComment: async (data) => await axiosApi.put(`${apiPath}`, data, url),
  deleteComment: async (id) => await axiosApi.delete(`${apiPath}/${id}`, url),
  getTargetNameByAppId: async (appId,targetId,targetType) => {
    if(appId == 5) return await storeCommentApi.getTargetName(targetId,targetType).then(res=>res.data).catch(e=>e?.data?.messages)
    else if(appId == 8) return await yarCommentApi.getTargetName(targetId,targetType).then(res=>res.data).catch(e=>e?.data?.messages)
  }
};
