<script setup>
import userApi from '@/services/api/identityServices/userApi';
import contentApi from '@/services/api/yarServices/contentApi';
import Sdialog from "@/components/SDialog.vue"
import dateConverter from '@/composables/dateConverter';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  posts: [],
  users:null,
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  post: {
    id: 0,
    title: null,
  },
  author:null,
  searchFilters: [],
  dialog: false,
  isDelete:false,
  isFilter:false,
  loading:false
})

const postStatus = [{id:1,title:"ارشیو",color:'orange'},{id:2,title:"منتشر",color:'green'},{id:3,title:"موقت",color:'blue'}]

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'پست ها',
      to: '/dashboard/post/list',
    }, ...b])
}

const getPosts = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    userId: null,
    searchFilters: [],
    contentType:2,
  }
  if (route.query.search) payload.searchFilters.push({ field: "title", operator: 6, value: route.query.search })
  if (route.query.author) payload.userId = state.users.find(x=>`${x.firstName} ${x.lastName}` == route.query.author).id
  const { data, metadata } = await contentApi.paged(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.posts = data
  state.metadata = metadata
}

const getUsers = async () =>{
  const payload = {
        pageSize: state.metadata.pageSize,
        pageIndex: state.metadata.pageIndex,
        search:state.search ?? '',
    }
    const { data, metadata } = await userApi.getAll(payload)
        .then((res) => res)
        .catch((e) => notification.apiError(e?.data?.messages))
        state.users = data
        state.metadata = metadata
}

const changePageing = () => {
  let path = '/dashboard/post/list'
  let query = null
  if (state.metadata.pageSize) query = { ...query, size: state.metadata.pageSize }
  if (state.metadata.pageIndex) query = { ...query, index: state.metadata.pageIndex }
  if (state.searchFilters.value && state.searchFilters.value != '') query = { ...query, search: state.searchFilters.value }
  if (state.author) query = { ...query, author: state.author }
  
  router.replace({ path, query })
  setTimeout(() => {
    getPosts()
  }, 50);
}

const deletePost = async (id) => {
  await contentApi.delete(id)
    .then(res => res.data)
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getPosts()
}

const handleDelete = (post) => {
  state.post = {
    id: post.id,
    title: post.title,
  }
  state.dialog = true
  state.isFilter = false
  state.isDelete= true
}

const handleAuthorSearch = () =>{
  state.loading = true
  if(!state.users) getUsers()
  state.dialog = !state.dialog
  state.isFilter = true
  state.isDelete= false
  state.loading = false
}

const filterAuthor = (user) =>{
    state.dialog = false
    if(user.firstName) state.author = `${user.firstName} ${user.lastName}`
    else state.author = null
    state.selectedUser = state.author
    changePageing()
}

setBreadCrumb()
getPosts()

</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>پست ها</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify" class="pl-5"></v-text-field>
    </v-form>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field label="نویسنده" density="compact" variant="outlined" v-model="state.selectedUser" readonly append-inner-icon="mdi-magnify" class="pl-5" hide-details @click="handleAuthorSearch" clearable @click:clear="filterAuthor"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="pl-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" to="/dashboard/post/add/">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>

  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th class="text-center"><strong>دسته بندی</strong></th>
          <th class="text-center"><strong>نویسنده</strong></th>
          <th class="text-center"><strong>وضعیت</strong></th>
          <th class="text-center"><strong>تاریخ ایجاد</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(post, i) in state.posts" :key="post.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ post.title }}</td>
          <td class="text-center"><v-chip variant="text">{{ post.categoryTitle }}</v-chip></td>
          <td class="text-center"><v-chip variant="text">{{ post.author }}</v-chip></td>
          <td class="text-center"><v-chip :class="`bg-${postStatus.find(x=>x.id === post.status).color} text-white`">{{ postStatus.find(x=>x.id === post.status).title }}</v-chip></td>
          <td class="text-center">{{ dateConverter.convertToJalali( post.createdOnUtc) }}</td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn class="text-orange" variant="text" :to="'/dashboard/post/edit/' + post.id" icon="mdi-pen"></v-btn>
              <v-btn class="text-red" @click="handleDelete(post)" icon="mdi-delete" variant="text"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>


  <Sdialog v-model="state.dialog" :title="state.isDelete ? 'حذف پست' : 'انتخاب نویسنده'" :size="state.isDelete ? 'xs' : 'xl'">
    <template v-if="state.isDelete">
      <v-card flat>
        <v-card-text>
          <p class="mb-3"> پست <strong>{{ state.post.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
            عملیات حذف غیر قابل بازگشت است!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deletePost(state.post.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>
    <template v-else>
      <template v-if="state.loading"><p class="text-center"><strong>در حال بارگزاری اطلاعات</strong></p></template>
        <template v-else>
            <v-text-field v-model="state.search" type="search" variant="outlined" density="compact" label="جستجو" hide-details append-inner-icon="mdi-magnify" @keyup.enter="getUsers"></v-text-field>
            <v-table>
                <thead>
                    <tr>
                        <th></th>
                        <th>نام کاربر</th>
                        <th>شماره تماس</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(user, i) in state.users" :key="user.id">
                        <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) +
                            1 }}</td>
                        <td>{{ user.firstName + ' ' + user.lastName }}</td>
                        <td>{{ user.phoneNumber }}</td>
                        <td class="text-end">
                            <v-btn class="bg-blue" @click="filterAuthor(user)">انتخاب</v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
            <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="getUsers"></v-pagination>
        </template>        
    </template>
  </Sdialog>
</template>
