<script setup>
import tagApi from '@/services/api/baseServices/tagApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const verifyForm = ref({});
const route = useRoute()
const router = useRouter()
const state = reactive({
  tags: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  tag: {
    id: 0,
    title: null,
  },
  searchFilters: [],
  dialog: false,
  isEdit:false,
  isDelete:false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'برچسب ها',
      to: '/dashboard/tag/list',
    }, ...b])
}

const getTags = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
  }
  const { data, metadata } = await tagApi.getAll(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.tags = data
  state.metadata = metadata
}

const add = async () =>{
    await tagApi.add(state.tag)
    .then(notification.success('برچسب باموفقیت اضافه شد'))
    .catch((e) => notification.apiError(e?.data?.messages))
    getTags()
    state.dialog=false
}

const edit = async () =>{
    await tagApi.edit(state.tag)
    .then(notification.success('ویرایش انجام شد'))
    .catch((e) => notification.apiError(e?.data?.messages))
    getTags()
    state.dialog=false
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: '/dashboard/tag/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: '/dashboard/tag/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getTags()
  }, 50);
}

const save = async () => {
    const { valid } = await verifyForm.value.validate()
    if (valid) {
        if (state.tag.id > 0){
          await edit();
        }
        else
            await add()
    }
}

const handleAdd= () =>{
    state.tag= {title: null}
    state.isEdit = false
    state.isDelete = false
    state.dialog = true
}

const handleEdit= (tag) =>{
    state.tag= {...tag}
    state.isEdit = true
    state.isDelete = false
    state.dialog = true
}

const handleDelete = (tag) => {
    state.tag = { ...tag }
    state.isEdit = false
    state.isDelete = true
    state.dialog = true
}

const deleteTag = async (id) => {
  await tagApi.delete(id)
    .then(notification.success('حذف انجام شد'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getTags()
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
};

setBreadCrumb()
getTags()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>برچسب ها</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handleAdd"><v-icon class="pa-1">mdi-plus</v-icon></v-btn>
  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong>وضعیت</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tag, i) in state.tags" :key="tag.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ tag.title }}</td>
          <td>
            <v-chip :class="tag.isAssigned?'bg-green' : 'bg-red'">{{ tag.isAssigned ? 'دسته دارد' : 'دسته ندارد'}}</v-chip>
          </td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn class="text-teal" variant="text" :to="`/dashboard/tag/${tag.id}`" icon="mdi-star"></v-btn>
              <v-btn class="text-orange" variant="text" @click="handleEdit(tag)" icon="mdi-pen"></v-btn>
              <v-btn class="text-red" variant="text" @click="handleDelete(tag)" icon="mdi-delete"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>


  <Sdialog v-model="state.dialog" size="xs">

    <template v-if="state.isDelete">
      <v-card flat>
        <v-card-text>
          <p class="mb-3"> برچسب <strong>{{ state.tag.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
            عملیات حذف غیر قابل بازگشت است!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deleteTag(state.tag.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <template v-if="!state.isDelete">
      <v-card flat>
        <v-form @submit.prevent="save" ref="verifyForm">
          <v-card-title>
            <span v-if="state.isEdit">ویرایش برچسب</span>
            <span v-else>افزودن برچسب</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-text-field v-model="state.tag.title" variant="outlined" label="عنوان*" density="compact"
              :rules="validator.title"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
            <v-btn class="bg-blue w-50" type="submit">تایید</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </template>

  </Sdialog>
</template>
