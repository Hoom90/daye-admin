<script setup>
import appApi from '@/services/api/baseServices/appApi';
import appCategoryApi from '@/services/api/baseServices/appCategoriesApi';
import categoriesApi from '@/services/api/baseServices/categoriesApi';
import SCheckListBox from '@/components/SCheckListBox.vue';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
    categories: [],
    app: null,
    assignApp: {
        categoryIds: [],
        appId: 0,
    },
    loading: false,
    appId: route.params.id,
    selectedCategories: []
})

const getApp = async () => {
    await appApi.getById(route.params.id)
        .then(res =>{
            state.app = res.data
            dashboardbreadcrumbstore().setBreadCrumbs([
                {
                    title: 'برنامه ها',
                    to: '/dashboard/apps/list',
                },
                {
                    title: state.app.title,
                },])

                state.assignApp.appId = state.app.id
            state.assignApp.categoryIds = state.app.categoryIds
            getCategories()
        })
        .catch(e => notification.apiError(e?.data?.messages))
}

const getCategories = async () => {
    state.categories = await categoriesApi.list({ appId: null })
        .then(res => res.data)
        .catch(e => notification.apiError(e?.data?.messages))
    for (const item of state.categories) {
        initCat(item)
    }
}

const initCat = (cat) => {
    if (state.assignApp.categoryIds.some(x => x == cat.id))
        cat.selected = true
    else
        cat.selected = false

    if (cat.subCategories.length > 0)
        for (const item of cat.subCategories) {
            initCat(item)
        }
}

const assignCategory = async () => {
    await appCategoryApi.assignToApp(state.assignApp)
        .then(res => {
            notification.success('عملیات موفق')
            router.push('/dashboard/apps/list')
        })
        .catch((e) => notification.apiError(e?.data?.messages))
}

const changeCat = () => {
    state.selectedTag = []
    for (const item of state.categories) selectedList(item)
    let temp = [...new Set(state.assignApp.categoryIds)]
    state.assignApp.categoryIds = temp
}

const selectedList = (cat) => {
    if (cat.selected) {
        state.selectedTag.push(cat.id)
        state.assignApp.categoryIds.push(cat.id)
    }
    else {
        state.selectedTag = state.selectedTag.filter(x => x != cat.id)
        state.assignApp.categoryIds = state.assignApp.categoryIds.filter(x => x != cat.id)
    }

    if (cat.subCategories.length > 0)
        for (const item of cat.subCategories) selectedList(item)
}

getApp()
</script>
<template>
    <v-toolbar class="mb-3">
        <v-toolbar-title class="ma-0 pa-3 px-5 rounded bg-white d-flex align-center shadow">{{ `تنظیمات
            ${state.app?.title}` }}</v-toolbar-title>
    </v-toolbar>
    <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
        <v-toolbar-title>
            <h2>{{ `انتساب دسته بندی به برنامه " ${state.app?.title} "` }}</h2>
        </v-toolbar-title>
        <v-btn class="bg-blue" @click="assignCategory">ذخیره و بازگشت</v-btn>
    </v-toolbar>
    <!-- <v-card flat>
        <v-card-item>
            <v-card-title>اختصاص دسته بندی</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row v-for="item in state.appCategories" class="border-b mx-0 py-1">
                    <v-col class="d-flex align-center pa-0">
                        {{ item.title }}
                    </v-col>
                    <v-col class="text-left pa-0">
                        <v-btn class="bg-red" icon="mdi-close" style="border-radius: 5px;height: 40px;width: 40px;"></v-btn>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card-item>
    </v-card> -->
    <v-card flat>
        <v-card-text>
            <template v-if="state.loading">
                <p class="text-center"><strong>در حال بارگزاری اطلاعات</strong></p>
            </template>
            <template v-else>
                <ul class="check-list-box">
                    <s-check-list-box v-model="state.categories" @change="changeCat"></s-check-list-box>
                </ul>
            </template>
        </v-card-text>
    </v-card>
</template>


<!-- <template>
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
            {{ state.assignApp.appCategoryIds }}
            <s-check-list-box v-model="state.categories" @change="changeCat"></s-check-list-box>
          </ul>
        </template>
      </v-card-text>
    </v-card>
  </template> -->