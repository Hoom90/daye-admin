<script setup>
import tagApi from "@/services/api/yarServices/tagApi"
import userApi from '@/services/api/identityServices/userApi';
import topicApi from '@/services/api/yarServices/topicApi';
import forumApi from '@/services/api/yarServices/forumApi';
import notification from "@/utils/notification.js"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
    forum: null,
    users: null,
    tags: [],
    topic: {
        title: null,
        description: null,
        isActive: true,
        keyword: [],
        forumId: route.params.forumId,
        userId: null,
    },
    metadata: {
        pageSize: 10,
        pageIndex: 1,
        totalPages: 0,
        totalCount: 0,
        hasPreviousPage: true,
        hasNextPage: true,
        parameters: null,
    },
    topicTitle:null,
    forumTitle:null,
    userTitle:null,
    categoryId:null,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تالارهای گفتگو',
      to: '/dashboard/forum/list',
    },
     ...b])
}

onMounted(async ()=>{
    await getTopic()
    await getForum()
})

const getTopic = async () => {
    if (route.params.id){
        await topicApi.getById(route.params.id)
        .then((res) => state.topic = res.data)
        .catch((e) => notification.apiError(e?.data?.messages))
        state.topic.userTitle = `${state.topic.userFirstName} ${state.topic.userLastName}`
        state.topicTitle = state.topic.title
    }
}

const getForum = async () => {
    await forumApi.getById(route.params.forumId)
    .then((res) => state.forum = res.data)
    .catch((e) => notification.apiError(e?.data?.messages))
    setBreadCrumb([{
      title: `موضوعات تالار گفتگوی ${state.forum.title}`,
      to: `/dashboard/forum/${route.params.forumId}/topic/list`,
    },{
        title: route.params.id ? `ویرایش موضوع ${state.topic.title}` : 'افزودن موضوع جدید',
    }])
}

const getTags = async () =>{
  await tagApi.byCatId(state.forum.categoryId)
    .then(res => state.tags = res.data)
    .catch((e) => notification.apiError(e?.data?.messages))
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

const add = async () =>{
    await topicApi.add(state.topic)
    .then(res=>{
        notification.success('افزودن جدید انجام شد')
        router.push(`/dashboard/forum/${route.params.forumId}/topic/edit/${res.data}`)
    })
    .catch(e=>notification.apiError(e?.data?.messages))
}

const edit = async () => {
    await topicApi.edit(state.topic)
    .then(res=>notification.success('ویرایش انجام شد'))
    .catch(e=>notification.apiError(e?.data?.messages))
}

const save = async () => {
    const { valid } = await verifyForm.value.validate()
    if(!state.topic.forumId) notification.apiError('تالار را انتخاب کنید')
    if (valid) state.topic.id > 0 ? await edit() : await add()
}

const handleNewUserDialog = () => {
    state.dialog = !state.dialog
    if(!state.users){
        state.loading = true
        getUsers()
        state.loading = false
    }
    if(state.tags.length == 0){
        state.loading = true
        getTags()
        state.loading = false
    }
}

const handleNewUser = (user) =>{
    state.topic.userId = user.id
    state.topic.userTitle = `${user.firstName} ${user.lastName}`
    state.dialog = false
}

const validator = {
    userId: [(value) => value ? true : "وارد کردن کاربر اجباری است."],
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    forumTitle: [(value) => value ? true : "وارد کردن تالار اجباری است."],
    keyword: [(value) => value ? true : "وارد کردن حداقل یک کلمه کلیدی اجباری است."],
};
</script>

<template>
    <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
        <v-toolbar-title>
            <h2>{{ route.params.action == 'edit' ? `ویرایش موضوع ${state.topicTitle}` : 'افزودن موضوع جدید' }}</h2>
        </v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="save" ref="verifyForm">
        <v-card flat>
            <v-card-title primary-title>اطلاعات موضوع جدید</v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <v-row no-gutters>
                    <v-col cols="12" lg="6" class="pa-1">
                        <v-text-field v-model="state.topic.userTitle" variant="outlined" density="compact"
                            label="کاربر*" class="mb-2" :rules="validator.userId" @click="handleNewUserDialog"
                            append-inner-icon="mdi-magnify"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6" class="pa-1">
                        <v-text-field v-model="state.topic.title" variant="outlined" density="compact" label="عنوان*"
                            class="mb-2" :rules="validator.title"></v-text-field>
                    </v-col>
                    <v-col cols="12" class="pa-1">
                        <v-autocomplete v-model="state.topic.keyword" :items="state.tags" item-title="title"
                            item-value="title" variant="outlined" density="compact" label="کلیدواژه*" class="mb-2"
                            :rules="validator.keyword" multiple></v-autocomplete>
                    </v-col>
                    <v-col cols="12" class="pa-1">
                        <v-textarea v-model="state.topic.description" variant="outlined" density="compact"
                            label="توضیحات" class="mb-2" multiple></v-textarea>
                    </v-col>
                    <v-col cols="12" class="pa-1">
                        <v-radio-group v-model="state.topic.isActive" inline>
                            <v-radio label="فعال" :value="true"></v-radio>
                            <v-radio label="غیرفعال" :value="false"></v-radio>
                        </v-radio-group>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn class="bg-blue" type="submit" block>ذخیره</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>





    <s-dialog v-model="state.dialog" size="xl" title="انتخاب کاربر">
        <v-text-field v-model="state.search" type="search" variant="outlined" density="compact" label="جستجو"
            hide-details append-inner-icon="mdi-magnify" @keyup.enter="getUsers"></v-text-field>
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
                    <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
                    <td>{{ user.firstName + ' ' + user.lastName }}</td>
                    <td>{{ user.phoneNumber }}</td>
                    <td class="text-end">
                        <v-btn class="bg-blue" @click="handleNewUser(user)">انتخاب</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>
        <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex"
            @update:modelValue="getUsers"></v-pagination>
    </s-dialog>
</template>
<style>
.radius-right {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>
