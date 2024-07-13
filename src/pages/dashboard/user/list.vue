<script setup>
import userApi from '@/services/api/identityServices/userApi';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  users: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  searchFilters: [],
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'کاربران',
      to: '/dashboard/user/list',
    }, ...b])
}

const getUsers = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    search: '',
  }
  const { data, metadata } = await userApi.getAll(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.users = data
  state.metadata = metadata
}

const changePageing = () => {
  let query = { size: state.metadata.pageSize, index: state.metadata.pageIndex }
  if (state.searchFilters.value && state.searchFilters.value != '') {
    query.search = state.searchFilters.value
  }

  router.replace({ path: '/dashboard/user/list', query })

  setTimeout(() => {
    getUsers()
  }, 50);
}

setBreadCrumb()
getUsers()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
      <v-toolbar-title><h2>کاربران</h2></v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact"
                    label="جستجو" hide-details @click:append-inner="changePageing"
                    append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
      <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
                label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>


  </v-toolbar>


  <v-card>
    <v-table>
      <thead>
      <tr>
        <th><strong>ردیف</strong></th>
        <th><strong>نام و نام خانوادگی</strong></th>
        <th><strong>شماره تماس</strong></th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(user, i) in state.users" :key="user.id">
        <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
        <td>{{ `${user.firstName} ${user.lastName}` }}</td>
        <td>{{ user.phoneNumber }}</td>
        <td>
          <div class="float-left d-flex ga-1">
            <v-btn variant="text" class="text-orange" :to="`/dashboard/user/${user.id}`" icon="mdi-pen"></v-btn>
          </div>
        </td>
      </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>
</template>
