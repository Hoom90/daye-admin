<script setup>
import attributeApi from '@/services/api/store/attributesApi';
import categoriesApi from '@/services/api/store/categoriesApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const verifyForm = ref({});
const route = useRoute()
const router = useRouter()
const state = reactive({
  attributes: [],
  categories: null,
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  attribute: {
    id: 0,
    title: null,
    attributeType: 0,
    categoryIds: 0
  },
  categoryId:null,
  searchFilters: [],
  dialog: false,
  isDelete:false,
  isEdit:false,
  loading:false,
})

const attributeTypes =[
    {
       id:0,
       title:'متنی',
    },
    {
      id:1,
      title:'نمایشی',
    },
    {
      id:2,
      title: 'انتخابی',
    }
]

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'ویژگی ها ',
      to: '/dashboard/attribute/list',
    }, ...b])
}

const getAttributes = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
    categoryId: state.categoryId,
  }
  const { data, metadata } = await attributeApi.list(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.attributes = data
  state.metadata = metadata
}

const getAttributeById = async (id) =>{
  const { data } = await attributeApi.getById(id)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
    let temp = []
    data.categories.filter(x=>{
      temp.push(
        x.id,
      )
    })
    data.categories = temp
    state.attribute = {
      id: data.id,
      title: data.title,
      attributeType: data.attributeType,
      categoryIds: data.categories
    }
}

const getCategories = async () =>{
    const { data } = await categoriesApi.getAll()
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
    state.categories = data.filter(x=>x.hasChild == false)
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: '/dashboard/attribute/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: '/dashboard/attribute/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getAttributes()
  }, 50);
}

const add= async () =>{
  let payload = {
    title: state.attribute.title,
    attributeType: state.attribute.attributeType,
    categoryIds: state.attribute.categoryIds
  }
  await attributeApi.add(payload)
    .then(notification.success('افزودن موفق'))
    .catch((e) => notification.apiError(e?.data?.messages))
    state.dialog = false
    getAttributes()
}

const edit = async () =>{
  let payload = {
    id: state.attribute.id,
    title: state.attribute.title,
    attributeType: state.attribute.attributeType,
    categoryIds: state.attribute.categoryIds,
  }
  await attributeApi.edit(payload)
    .then(notification.success('ویرایش موفق'))
    .catch((e) => notification.apiError(e?.data?.messages))
    state.dialog = false
    getAttributes()
}

const deleteAttribute = async (id) => {
  await attributeApi.delete(id)
    .then(notification.success('حذف موفق'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getAttributes()
}

const handleAdd = () =>{
    state.loading=true
    if(!state.categories) getCategories()
    state.loading=false
    state.isDelete = false
    state.isEdit = false
    state.attribute = {
        title: null,
        attributeType: null,
        categoryId: null
    },
    state.dialog = true
}

const handleEdit = (attribute) =>{
    state.loading=true
    if(!state.categories) getCategories()
    getAttributeById(attribute.id)
    state.loading = false
    state.isDelete = false
    state.isEdit = true
    state.dialog = true
}

const handleDelete = (attribute) => {
  state.attribute = {
    id: attribute.id,
    title: attribute.title,
  }
  state.isDelete =true
  state.dialog = true
}

const save = async () =>{
  const { valid } = await verifyForm.value.validate()
  if(valid){
    if(state.attribute.attributeType == '0') state.attribute.attributeType = parseInt(state.attribute.attributeType)
    if(state.isEdit){
      edit()
    }
    else{
      add()
    }
  }
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    categoryId: [(value) => value ? true : "وارد کردن دسته بندی اجباری است."],
    attributeType: [(value) =>{
      if(value == 0) return true
      if(!value) return "وارد کردن نوع اجباری است"
      return true
    }],
};

setBreadCrumb()
getAttributes()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>ویژگی ها</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        @click:append-inner="changePageing" hide-details append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" class="mx-5"
      density="compact" label="تعداد نمایش" hide-details @update:modelValue="changePageing"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handleAdd"><v-icon>mdi-plus</v-icon></v-btn>
  </v-toolbar>


  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(attribute, i) in state.attributes" :key="attribute.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ attribute.title }}</td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn variant="text" v-if="attribute.attributeType != 0" class="text-teal" icon="mdi-star" :to="`/dashboard/attribute/values/${attribute.id}`"></v-btn>
              <v-btn variant="text" class="text-orange" icon="mdi-pen" @click="handleEdit(attribute)"></v-btn>
              <v-btn variant="text" class="text-red" @click="handleDelete(attribute)" icon="mdi-delete"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
    <v-card-text>
      <v-pagination :length="state.metadata.totalPages" v-model="state.metadata.pageIndex"
        @update:modelValue="changePageing"></v-pagination>
    </v-card-text>
  </v-card>


  <Sdialog v-model="state.dialog" :title="state.isDelete ? 'حذف ویژگی' : state.isEdit ? 'ویرایش ویژگی' : 'افزودن ویژگی'" size="xs">
    <template v-if="!state.isDelete">
      <template v-if="state.loading"><p class="text-center"><strong>در حال بارگزاری اطلاعات</strong></p></template>
      <template v-else>
        <v-form @submit.prevent="save" ref="verifyForm">
          <v-card flat>
            <v-card-text>
              <v-text-field v-model="state.attribute.title" variant="outlined" density="compact" label="عنوان*"
                class="mb-2" :rules="validator.title"></v-text-field>
              <v-select v-model="state.attribute.attributeType" :items="attributeTypes" item-title="title" item-value="id"
                variant="outlined" density="compact" label="نوع*" class="mb-2" :rules="validator.attributeType"></v-select>
              <v-autocomplete v-model="state.attribute.categoryIds" :items="state.categories ?? []" item-title="title"
                item-value="id" variant="outlined" density="compact" label="دسته بندی*" class="mb-2" multiple
                :rules="validator.categoryId"></v-autocomplete>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="outlined" class="w-50 bg-red" @click="state.dialog = !state.dialog">لغو</v-btn>
              <v-btn variant="outlined" class="w-50 bg-blue" type="submit">ذخیره</v-btn>
            </v-card-actions>
          </v-card>
        </v-form>
      </template>
    </template>
    <template v-else>
      <v-card flat>
        <v-card-text>
          <p class="mb-3"> ویژگی <strong>{{ state.attribute.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
            عملیات حذف غیر قابل بازگشت است!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deleteAttribute(state.attribute.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </Sdialog>
</template>
