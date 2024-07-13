<script setup>
import forumApi from '@/services/api/yarServices/forumApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  forums: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  forum: {
    id: 0,
    title: null,
  },
  searchFilters: [],
  dialog: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تالارهای گفتگو',
      to: '/dashboard/forum/list',
    }, ...b])
}

const getForums = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
  }
  const { data, metadata } = await forumApi.list(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.forums = data
  state.metadata = metadata
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: '/dashboard/forum/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: '/dashboard/forum/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getForums()
  }, 50);
}

const handleDelete = (forum) => {
  state.forum = {
    id: forum.id,
    title: forum.title,
  }
  state.dialog = true
}

const deleteForum = async (id) => {
  await forumApi.delete(id)
    .then(notification.success('عملیات موفق'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getForums()
}

setBreadCrumb()
getForums()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>تالارهای گفتگو</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو" hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact" label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" to="/dashboard/forum/add/">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong>دسته بندی</strong></th>
          <th class="text-center"><strong>وضعیت</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(forum, i) in state.forums" :key="forum.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ forum.title }}</td>
          <td>
            <v-chip>{{ forum.categoryName }}</v-chip>
          </td>
          <td class="text-center">
            <v-chip :class="forum.isActive ? 'bg-green' : 'bg-red'">{{ forum.isActive ? 'فعال' : 'غیرفعال' }}</v-chip>
          </td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn class="text-teal" variant="text" :to="`/dashboard/forum/${forum.id}/topic/list`" icon="mdi-email-outline"></v-btn>
              <v-btn class="text-orange" variant="text" :to="'/dashboard/forum/edit/' + forum.id" icon="mdi-pen"></v-btn>
              <v-btn class="text-red" @click="handleDelete(forum)" icon="mdi-delete" variant="text"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>


  <Sdialog v-model="state.dialog" title="حذف تالار گفتگو" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> تالار گفتگو <strong>{{ state.forum.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟ عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteForum(state.forum.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>
