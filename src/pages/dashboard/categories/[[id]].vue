<script setup>
import Sdialog from "@/components/SDialog.vue"
import categoriesApi from '@/services/api/baseServices/categoriesApi';
import Suploader from "@/components/SUploader.vue";
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
import { onMounted, onUpdated } from "vue";
import tagsApi from "@/services/api/store/tagsApi";
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
  categories: [],
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
  category: {
    id: 0,
    title: null,
    sort: 0,
    imageId: null,
    parentCategoryId: null,
  },

  dialog: false,
  deleteDialog: false,
  actionDialog: false,
  tagsDialog: false,
  dialogTitle: null,


  searchFilters: [],
  imageError: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'دسته ها ',
      to: '/dashboard/categories',
    }, ...b])
}

const getCategories = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
    parentCategoryId: route.params.id == '' ? null : route.params.id,
  }
  const { data, metadata } = await categoriesApi.getAll(payload)
    .then(res => res)
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.categories = data
  state.metadata = metadata

  if (route.params.id)
    parents()
}

const getTags = async () =>{
  const { data } = await tagsApi.getByCatId(state.category.id)
    .then(res => res)
    .catch(erorr => notification.apiError(erorr?.data?.messages))
    state.tags = data
}

const save = async (values) => {
  const { valid } = await verifyForm.value.validate()
  if (!valid) {
    notification.error('فرم را کامل کنید')
    return
  }
  if (!state.category.imageId) {
    state.imageError = true
    notification.error('وارد کردن عکس شاخص اجباری است')
    return
  }

  if (state.category.id > 0)
    await edit();
  else
    await add()
}

const add = async () => {
  await categoriesApi.add(state.category)
    .then(res => notification.success('دسته ایجاد شد'))
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.actionDialog = false
  state.dialog = false
  getCategories()
}

const edit = async () => {
  await categoriesApi.edit(state.category)
    .then(res => notification.success('دسته ویرایش شد'))
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.actionDialog = false
  state.dialog = false
  getCategories()
}

const deleteCategory = async (id) => {
  await categoriesApi.deleteById(id)
    .then(res => res.data)
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.dialog = false
  getCategories()
}

const handelAddEditDialog = (category) => {
  if (category) {
    state.category = { ...category }
    state.dialogTitle = "ویرایش دسته بندی"
  }
  else {
    state.dialogTitle = 'افزودن دسته بندی'
    state.category.id = null
    state.category.title = null
    state.category.imageId = null
    state.category.parentCategoryId = route.params.id == '' ? null : route.params.id
  }
  state.actionDialog = true
  state.deleteDialog = false
  state.tagsDialog = false
  state.dialog = true
}

const handleDelete = (item) => {
  state.category = {
    id: item.id,
    title: item.title,
  }
  state.dialogTitle = "حذف دسته بندی"
  state.actionDialog = false
  state.deleteDialog = true
  state.tagsDialog = false
  state.dialog = true
}

const handleTags = (category) =>{
  state.category = {
    id: category.id,
    title: category.title,
  }
  state.dialogTitle = `برچسب های دسته بندی ${state.category.title}`
  getTags()
  state.actionDialog = false
  state.deleteDialog = false
  state.tagsDialog = true
  state.dialog = true
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: '/dashboard/categories', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: '/dashboard/categories', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getCategories()
  }, 50);
}

const parents = async () => {
  await categoriesApi.parents(route.params.id)
    .then(r => {
      const list = r.data?.parents.map(x => ({
        title: x.title,
        disabled: false,
        to: '/dashboard/categories/' + x.id,
      }))
      setBreadCrumb([
        ...list,
        {
          title: r.data.title,
          disabled: true,
          to: '/dashboard/categories/',
        }
      ])
    }).catch(e => notification.apiError(e?.data?.messages))
}


const validator = {
  title: [
    (value) => {
      if (value) return true;
      return "وارد کردن نام دسته بندی اجباری است.";
    },
  ],
}

onMounted(() => {
  setBreadCrumb()
  getCategories()
})

onUpdated(() => {
  setBreadCrumb()
  getCategories()
})

</script>

<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>دسته بندی ها</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[5, 10, 15, 20, 50]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handelAddEditDialog()">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>








  <!-- جدول نمایش اطلاعات دسته بندی ها -->
  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong></strong></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(category, i) in state.categories" :key="category.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ category.title }}</td>
          <td class="text-center">
            <div class="float-left d-flex ga-1">
              <v-btn class="text-teal" variant="text" @click="handleTags(category)" icon="mdi-tag"></v-btn>
              <v-btn class="text-blue" variant="text" :to="`/dashboard/categories/${category.id}`" icon="mdi-source-fork"></v-btn>
              <v-btn class="text-orange" variant="text" @click="handelAddEditDialog(category)" icon="mdi-pen"></v-btn>
              <v-btn class="text-red" variant="text" @click="handleDelete(category)" icon="mdi-delete"></v-btn>
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

  <Sdialog v-model="state.dialog" :title="state.dialogTitle" size="xs">

    <!-- دیالوگ ویرایش دسته بندی -->
    <template v-if="state.actionDialog">
      <v-form @submit.prevent="save" ref="verifyForm">
        <v-card flat>
          <v-card-text>
            <Suploader v-model="state.category.imageId" style="width: 200px;" class="mx-auto" />
            <span v-if="state.imageError">وارد کردن عکس شاخص الزامی است</span>
            <v-text-field density="compact" variant="outlined" label="عنوان" autofocus v-model="state.category.title"
              :rules="validator.title"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn class="border w-50"
              @click="state.actionDialog = !state.actionDialog; state.dialog = false">لغو</v-btn>
            <v-btn class="bg-blue w-50" type="submit">تایید</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>

    <!-- دیالوگ حذف دسته بندی -->
    <template v-if="state.deleteDialog">
      <v-card flat>
        <v-card-text>
          <p class="mb-3"> دسته <strong>{{ state.category.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
            عملیات حذف غیر قابل بازگشت است!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50"
            @click="state.deleteDialog = !state.deleteDialog; state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deleteCategory(state.category.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <template v-if="state.tagsDialog">
      <v-card flat>
        <v-card-title><small>{{ state.dialogTitle }}</small></v-card-title>
        <v-card-text class="d-flex ga-1 flex-wrap" v-if="state.tags.length > 0">
          <v-chip close v-for="tag in state.tags" :key="tag.id">{{tag.title}}</v-chip>
        </v-card-text>
        <v-card-text v-else class="text-center">
          <strong class="text-red">بدون برچسب :(</strong>
        </v-card-text>
      </v-card>
    </template>

  </Sdialog>
</template>
