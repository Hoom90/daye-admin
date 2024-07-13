<script setup>
import forumApi from '@/services/api/yarServices/forumApi';
import categoriesApi from '@/services/api/yarServices/categoriesApi';
import Suploader from "@/components/SUploader.vue"
import notification from "@/utils/notification.js"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
    forum: {
        title: null,
        description: null,
        isActive: true,
        imageId: null,
        iconId: null,
        categoryId: 0,
    },
    categories:[],
    imageError:false,
    iconError:false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تالارهای گفتگو',
      to: '/dashboard/forum/list',
    },
    {
      title: route.params.action == 'edit' ? 'ویرایش تالار' : 'افزودن تالار',
    },
     ...b])
}

const getForum = async () => {
    await forumApi.getById(route.params.id)
        .then((res) => state.forum = res.data)
        .catch((e) => notification.apiError(e?.data?.messages))
}

const getCategories = async () => {
  const { data } = await categoriesApi.getAll()
    .then(res => res)
    .catch(e => notification.apiError(e?.data?.messages))
  state.categories = data.filter(x=>x.hasChild == false)
}

const add = async () =>{
    await forumApi.add(state.forum)
    .then(res=>{
        notification.success('افزودن جدید انجام شد')
        router.push(`/dashboard/forum/edit/${res.data}`)
    })
    .catch(e=>notification.apiError(e?.data?.messages))
}

const edit = async () => {
    await forumApi.edit(state.forum)
    .then(res=>notification.success('ویرایش انجام شد'))
    .catch(e=>notification.apiError(e?.data?.messages))
}

const save = async () => {
    const { valid } = await verifyForm.value.validate()
    if (!state.forum.imageId) state.imageError = true
    if (!state.forum.iconId) state.iconError = true
    if (valid && !state.imageError && !state.iconError) {
        if (state.forum.id > 0)
            await edit();
        else
            await add()
    }
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    description: [(value) => value ? true : "وارد کردن توضیحات اجباری است."],
    categoryId: [(value) => value ? true : "وارد کردن دسته بندی اجباری است."],
};

onUpdated(()=>{
    setBreadCrumb()
})
if (route.params.id) {
    getForum()
}
getCategories()
</script>

<template>
    <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
        <v-toolbar-title>
            <h2>{{ route.params.action == 'edit' ? 'ویرایش تالار' : 'افزودن تالار' }}</h2>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!route.params.action" class="bg-blue ma-0 radius-right h-100" to="/dashboard/product/add/"><v-icon
                class="pa-1">mdi-plus</v-icon></v-btn>
    </v-toolbar>

    <v-form @submit.prevent="save" ref="verifyForm">
        <v-row>


            <v-col cols="12" md="4">
                <v-card flat>
                    <v-card-title primary-title>عکس و آیکن</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-row no-gutters>
                            <v-col cols="8" md="12" class="mx-auto">
                                <v-row>
                                    <v-col cols="6" md="12">
                                        <label>عکس</label>
                                        <Suploader v-model="state.forum.imageId" class="mt-3" :multiple="false" />
                                    </v-col>
                                    <v-col cols="6" md="12">
                                        <label>آیکن</label>
                                        <Suploader v-model="state.forum.iconId" class="mt-3" :multiple="false"
                                            text="بارگزاری آیکن" />
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

            </v-col>

            <v-col cols="12" md="8">
                <v-card flat>
                    <v-card-title primary-title>اطلاعات تالار</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-text-field label="عنوان تالار*" density="compact" variant="outlined" class="mb-1"
                            v-model="state.forum.title" :rules="validator.title"></v-text-field>

                        <v-autocomplete label="دسته بندی تالار*" :items="state.categories" item-title="title"
                            item-value="id" class="mb-1" density="compact" variant="outlined"
                            v-model="state.forum.categoryId" :rules="validator.categoryId"></v-autocomplete>

                        <v-textarea label="توضیحات*" density="compact" variant="outlined"
                            v-model="state.forum.description" rows="10" :rules="validator.description"></v-textarea>

                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-btn class="bg-blue" type="submit" block>ذخیره</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
    </v-form>
</template>
<style>
.radius-right {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>
