<script setup>
import categoriesApi from '@/services/api/baseServices/categoriesApi';
import tagApi from '@/services/api/baseServices/tagApi';
import SCheckListBox from '@/components/SCheckListBox.vue';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  categories: [],
  tag: {
    id: 0,
    title: null,
  },
  assignTag: {
    appCategoryIds: [],
    tagId: 0,
  },
  loading: false,
  appId: 5,
})

const storeConst = [{ id: 5, title: 'فروشگاه' }, { id: 8, title: 'دایه یار' },{ id: 28, title: 'test' }]

const getCategories = async () => {
  const { data } = await categoriesApi.list({ appId: state.appId })
    .then(res => res)
    .catch(e => notification.apiError(e?.data?.messages))
    state.categories = data
  for (const item of state.categories) initCat(item)
}

const getTag = async () => {
  const { data } = await tagApi.getById(route.params.id)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.tag = data
  state.assignTag.tagId = state.tag.id
  state.selectedList = state.tag.appCategory
  for (const cat of state.tag.appCategory) state.assignTag.appCategoryIds.push(cat.appCategoryId)
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'برچسب ها',
      to: '/dashboard/tag/list',
    },
    {
      title: state.tag.title,
    },])
  getCategories()
}

const initCat = (cat) => {
  if (state.selectedList.some(x => x.appCategoryId == cat.appCategoryId))
    cat.selected = true
  else
    cat.selected = false

  if (cat.subCategories.length > 0)
    for (const item of cat.subCategories) {
      initCat(item)
    }
}

const assignCategory = async () => {
  await tagApi.assignToCategory(state.assignTag)
    .then(res => {
      notification.success('دسته بندی باموفقیت اضافه شد')
      router.push('/dashboard/tag/list')
    })
    .catch((e) => notification.apiError(e?.data?.messages))
}

const changeCat = () => {
  for (const item of state.categories) selectedList(item)
  let temp = [...new Set(state.assignTag.appCategoryIds)]
  state.assignTag.appCategoryIds = temp
}

const selectedList = (cat) => {
  if (cat.selected) state.assignTag.appCategoryIds.push(cat.appCategoryId)
  else state.assignTag.appCategoryIds = state.assignTag.appCategoryIds.filter(x => x != cat.appCategoryId)

  if (cat.subCategories.length > 0) for (const item of cat.subCategories) selectedList(item)
}

getTag()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>{{ `انتساب دسته بندی به برچسب " ${state.tag.title} "` }}</h2>
    </v-toolbar-title>
    <v-btn class="bg-blue" @click="assignCategory">ذخیره و بازگشت</v-btn>
  </v-toolbar>


  <v-card flat>
    <v-card-text>
      <template v-if="state.loading">
        <p class="text-center"><strong>در حال بارگزاری اطلاعات</strong></p>
      </template>
      <template v-else>
        <v-row>
          <v-spacer></v-spacer>
          <v-col cols="3">
            <v-select label="برنامه ها" v-model="state.appId" density="compact" variant="outlined" :items="storeConst"
              item-title="title" item-value="id" hide-details @update:model-value="getCategories"></v-select>
          </v-col>
        </v-row>
        <ul class="check-list-box">
          {{ state.assignTag.appCategoryIds }}
          <s-check-list-box v-model="state.categories" @change="changeCat"></s-check-list-box>
        </ul>
      </template>
    </v-card-text>
  </v-card>
</template>
