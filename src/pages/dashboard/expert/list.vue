<script setup>
import expertApi from '@/services/api/yarServices/expertApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  experts: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  expert: {
    id: 0,
    title: null,
  },
  searchFilters: [],
  dialog: false,
  advanceDialog:false,
  isConfirmFilter: null,
  isDeletedFilter: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'متخصصان',
      to: '/dashboard/expert/list',
    }, ...b])
}

const getExperts = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [],
    deleted: route.query.deleted == "true" ? true : false ?? false,
  }
  if (route.query.search) payload.searchFilters.push({ field: "user.firstName", operator: 6, value: route.query.search })
  if (route.query.isConfirm) payload.searchFilters.push({ field: "isConfirm", operator: 0, value: route.query.isConfirm })
  const { data, metadata } = await expertApi.list(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.experts = data
  state.metadata = metadata
}

const changePageing = () => {
  let path = '/dashboard/expert/list'
  let query = null
  if (state.metadata.pageSize) query = { ...query, size: state.metadata.pageSize }
  if (state.metadata.pageIndex) query = { ...query, index: state.metadata.pageIndex }
  if (state.searchFilters.value && state.searchFilters.value != '') query = { ...query, search: state.searchFilters.value }
  if (state.isDeletedFilter == true || state.isDeletedFilter == false) query = { ...query, deleted: state.isDeletedFilter }
  if (state.isConfirmFilter == true || state.isConfirmFilter == false) query = { ...query, isConfirm: state.isConfirmFilter }

  router.replace({ path, query })
  setTimeout(() => {
    getExperts()
  }, 50);
}

const handleDelete = (expert) => {
  state.expert = {
    id: expert.id,
    title: `${expert.firstName} ${expert.lastName}`,
  }
  state.dialog = true
}

const deleteExpert = async (id) => {
  await expertApi.delete(id)
    .then(notification.success('عملیات موفق'))
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.dialog = false
  getExperts()
}

const recoverExpert = async (expertId) => {
  await expertApi.recover(expertId)
    .then(res => {
      notification.success('بازیابی متخصص انجام شد')
      getExperts()
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

setBreadCrumb()
getExperts()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>متخصصان</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <!-- <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو" hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify" class="pl-5"></v-text-field>
    </v-form> -->
    <!-- <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
    label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="pl-5"></v-select> -->
    <!-- <v-select v-model="state.isConfirmFilter" @update:model-value="changePageing" variant="outlined"
      :items="[{title:'همه',id:null},{title:'تایید نشده',id:false},{title:'تایید شده',id:true}]" item-value="id"
      item-title="title" density="compact" label="نوع متخصص" hide-details class="me-5"></v-select> -->
    <!-- <v-select v-model="state.isDeletedFilter" :items="[{id: true, title:'حذف شده'}, {id: false, title:'حذف نشده'}]" variant="outlined" density="compact" label="وضعیت"
      item-title="title" item-value="id" hide-details @update:modelValue="changePageing" class="pl-5"></v-select> -->
    <v-dialog v-model="state.advanceDialog" transition="dialog-bottom-transition" class="w-50">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn append-icon="mdi-cog" size="small" text="جستجوی پیشرفته" class="ma-0 rounded-0 h-100" v-bind="activatorProps"></v-btn>
      </template>

      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="state.advanceDialog = !state.advanceDialog"></v-btn>
          <v-toolbar-title>جستجوی پیشرفته</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two" subheader class="my-10">
          <v-list-item>
            <v-form @submit.prevent="changePageing" style="display: contents;">
              <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact"
                label="جستجو" hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
            </v-form>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
              label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.isConfirmFilter" @update:model-value="changePageing" variant="outlined"
              :items="[{ title: 'همه', id: null }, { title: 'تایید نشده', id: false }, { title: 'تایید شده', id: true }]"
              item-value="id" item-title="title" density="compact" label="نوع متخصص" hide-details
              class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.isDeletedFilter"
              :items="[{ id: true, title: 'حذف شده' }, { id: false, title: 'حذف نشده' }]" variant="outlined"
              density="compact" label="وضعیت" item-title="title" item-value="id" hide-details
              @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>

    <v-btn class="bg-blue ma-0 rounded-0 h-100" to="/dashboard/expert/add/">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong>شماره تماس</strong></th>
          <th><strong>وضعیت</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(expert, i) in state.experts" :key="expert.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ `${expert.firstName} ${expert.lastName}` }}</td>
          <td><v-chip>{{ expert.phoneNumber }}</v-chip></td>
          <td>
            <v-chip :class="expert.isConfirm ? 'bg-green' : 'bg-red'">{{ `${expert.isConfirm ? 'تایید شده' : 'تایید نشده'}`}}</v-chip>
          </td>
          <td>
            <div class="float-left d-flex ga-1" v-if="!expert.deleted">
              <v-btn class="text-teal" variant="text" :to="`/dashboard/expert/schedule/${expert.id}`"
                icon="mdi-calendar"></v-btn>
              <v-btn class="text-orange" variant="text" :to="`/dashboard/expert/edit/${expert.id}`"
                icon="mdi-pen"></v-btn>
              <v-btn class="text-red" @click="handleDelete(expert)" icon="mdi-delete" variant="text"></v-btn>
            </div>
            <div class="float-left d-flex ga-1" v-else>
              <v-btn variant="text" class="text-blue" icon="mdi-plus-box" @click="recoverExpert(expert.id)"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex"
        @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>

  <Sdialog v-model="state.dialog" title="حذف متخصص" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> متخصص <strong>{{ state.expert.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟ عملیات حذف
          غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteExpert(state.expert.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>