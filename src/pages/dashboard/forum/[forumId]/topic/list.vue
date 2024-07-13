<script setup>
import forumApi from '@/services/api/yarServices/forumApi';
import topicApi from '@/services/api/yarServices/topicApi';
import Sdialog from "@/components/SDialog.vue"
import dateConverter from "@/composables/dateConverter"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  topics: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  topic: {
    id:0,
    title: null,
    description: null,
    isActive: true,
    keyword: [],
    forumId: route.params.forumId,
  },
  tags: [],
  forum: null,
  searchFilters: [],
  dialog: false,
  loading: false,
  isDelete: false,
  isEdit: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تالارهای گفتگو',
      to: '/dashboard/forum/list',
    }, ...b])
}

const getTopics = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
    forumId: route.params.forumId,
  }
  const { data, metadata } = await topicApi.list(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.topics = data
  state.metadata = metadata
}

const getForum = async () => {
  await forumApi.getById(route.params.forumId)
  .then(res => state.forum = res.data)
  .catch((e) => notification.apiError(e?.data?.messages))
  setBreadCrumb([
    {
      title: `موضوعات تالار گفتگوی ${state.forum.title}`,
      to: `/dashboard/forum/${state.forum.id}`,
    }
  ])
}

const deleteTopic = async (id) => {
  await topicApi.delete(id)
    .then(notification.success('عملیات موفق'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getTopics()
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: `/dashboard/forum/${route.params.forumId}/topic/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: `/dashboard/forum/${route.params.forumId}/topic/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getTopics()
  }, 50);
}

const handleDelete = (topic) => {
  state.topic = {
    id: topic.id,
    title: topic.title,
  }
  state.isDelete = true
  state.isEdit = false
  state.dialog = true
}

getForum()
getTopics()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2 class="text-wrap text-center"><small><small>موضوعات تالار گفتگو {{ state.forum?.title }}</small></small></h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" :to="`/dashboard/forum/${route.params.forumId}/topic/add`">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong>نویسنده</strong></th>
          <th><strong>تاریخ ایجاد</strong></th>
          <th><strong>وضعیت</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(topic, i) in state.topics" :key="topic.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ topic.title }}</td>
          <td>{{ `${topic.userFirstName} ${topic.userLastName}` }}</td>
          <td>{{ dateConverter.convertToJalali(topic.createdOnUtc)}}</td>
          <td><v-chip :class="topic.isActive ? 'bg-green' : 'bg-red'">{{ topic.isActive ? 'فعال' : 'غیرفعال' }}</v-chip></td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn class="text-teal" variant="text" :to="`/dashboard/forum/${route.params.forumId}/topic/${topic.id}/comment/list`" icon="mdi-chat"></v-btn>
              <v-btn class="text-orange" variant="text" :to="`/dashboard/forum/${route.params.forumId}/topic/edit/${topic.id}`" icon="mdi-pen"></v-btn>
              <v-btn class="text-red" @click="handleDelete(topic)" icon="mdi-delete" variant="text"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-actions class="d-flex justify-center">
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
    </v-card-actions>
  </v-card>


  <Sdialog v-model="state.dialog" :title="state.isDelete ? 'حذف موضوع' : state.isEdit ? 'ویرایش موضوع' : 'افزودن موضوع'" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> موضوع گفتگو <strong>{{ state.topic.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
          عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteTopic(state.topic.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>
