<script setup>
import storeApi from '@/services/api/store/storeApi';
import userApi from '@/services/api/identityServices/userApi';
import Suploader from "@/components/SUploader.vue"
import notification from "@/utils/notification.js"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
    store: {
        title: null,
        address: null,
        slogan: null,
        image: null,
        logo: null,
        storeType: 2,
        description: null,
        status: 1,
        isLocked: true,
    },
    newStore:{
        userId:null,
        title: null,
        address: null,
        slogan: null,
        image: null,
        logo: null,
        storeType: 2,
        description: null,
        status: 1,
        isLocked: true,
    },
    users: null,
    metadata: {
        pageSize: 10,
        pageIndex: 1,
        totalPages: 0,
        totalCount: 0,
        hasPreviousPage: true,
        hasNextPage: true,
        parameters: null,
    },
    imageError:false,
    logoError:false,
    dialog:false,
    selectedUser:null,
    search:'',
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'فروشگاه ها ',
      to: '/dashboard/store/list',
    },
     ...b])
}

const getUsers = async () =>{
    const payload = {
        pageSize: state.metadata.pageSize,
        pageIndex: state.metadata.pageIndex,
        search:state.search,
    }
    const { data, metadata } = await userApi.getAll(payload)
        .then((res) => res)
        .catch((e) => notification.apiError(e?.data?.messages))
        state.users = data
        state.metadata = metadata
        setBreadCrumb([
        {
            title: 'افزودن فروشگاه',
        }
    ])
}

const getStore = async () => {
    state.store = await storeApi.getById(route.params.storeid)
        .then((res) => res.data)
        .catch((error) => notification.apiError(error?.data?.messages))
    state.newStore = { ...state.store }
    setBreadCrumb([
        {
            title: state.store.title,
            to: `/dashboard/store/${state.store.id}`,
        }
    ])
}

const add = async () =>{
    await storeApi.add(state.newStore)
    .then(res=>{
        state.user=null
        notification.success('افزودن جدید انجام شد')
        router.push(`/dashboard/store/edit/${res.data}`)
    })
    .catch(error=>notification.apiError(error?.data?.messages))
}

const edit = async () => {
    await storeApi.edit(state.newStore)
    .then(res=>{
        notification.success('بروزرسانی انجام شد')
        getStore()
    })
    .catch(error=>notification.apiError(error?.data?.messages))
}

const save = async (values) => {
    const { valid } = await verifyForm.value.validate()
    if (valid) {
        if (state.newStore.id > 0)
            await edit();
        else
            await add()
    }
    if (!state.newStore.image) state.imageError = true
    if(!state.newStore.logo) state.logoError = true
}

const validator = {
    userId: [(value) => value ? true : 'وارد کردن کاربر اجباری است'],
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    slogan: [(value) => {
        if(!value) return "وارد کردن شعار اجباری است."
        if(value.length > 25) return "حداکثر کارکتر ورودی 25 است"
        return true
    }],
    address: [(value) => value ? true : "وارد کردن آدرس اجباری است."],
    description: [(value) => {
        if(!value) return "وارد کردن توضیحات مختصر اجباری است."
        if(value.length > 100) return "حداکثر کارکتر ورودی 100 است"
        return true
    }],
};

setBreadCrumb()
state.store= {
    title: null,
    address: null,
    slogan: null,
    image: null,
    logo: null,
    storeType: 2,
    description: null
}
if (route.params.storeid) {
    getStore()
}else{
    getUsers()
}

const handleNewUser = (user) =>{
    state.newStore.userId = user.id
    state.dialog = false
    state.selectedUser = user.firstName + ' ' + user.lastName
}
</script>

<template>
    <v-toolbar class="mb-3">
        <div class="d-flex h-75 w-100 pa-0 shadow rounded bg-white">
            <v-toolbar-title class="ma-0 pa-3 px-5 rounded bg-white radius-left d-flex align-center">{{
                route.params.storeaction ? route.params.storeaction == 'edit' ? `ویرایش ${state.store.title}` : 'افزودن فروشگاه' :
                ''
                }}</v-toolbar-title>
            <v-btn v-if="!route.params.storeaction" class="bg-blue ma-0 radius-right h-100"
                to="/dashboard/store/add/"><v-icon class="pa-1">mdi-plus</v-icon></v-btn>
        </div>
    </v-toolbar>

    <v-form @submit.prevent="save" ref="verifyForm">
        <v-row>


            <v-col cols="6" md="4">
                <v-card flat class="h-100">
                    <v-card-item class="h-100">
                        <v-card-text class="h-75">
                            <v-label class="mb-3">عکس*:</v-label>
                            <Suploader v-model="state.newStore.image" class="w-75 mx-auto"
                                :hasButton="!state.store.isLocked" :disabled="state.store.isLocked" />
                                <p v-if="state.imageError" class="text-red mb-3">وارد کردن عکس اجباری است</p>
                                <v-label class="mb-3">لوگو*:</v-label>
                                <Suploader v-model="state.newStore.logo" class="w-75 mx-auto"
                                :hasButton="!state.store.isLocked" :disabled="state.store.isLocked" />
                                <p v-if="state.logoError" class="text-red">وارد کردن لوگو اجباری است</p>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>

            <v-col cols="6" md="8">
                <v-card flat>
                    <v-card-item>
                        <v-card-text>

                            <div class="d-flex ga-1 mb-2">
                                <template v-if="state.users">
                                    <v-text-field label="نام کاربر" density="compact" variant="outlined" :rules="validator.userId" v-model="state.selectedUser" readonly></v-text-field>
                                    <v-btn @click="state.dialog = !state.dialog" class="text-blue border-none mt-1" icon="mdi-magnify" style="border-radius: 5px;" density="comfortable"></v-btn>
                                </template>
                                <v-btn v-else class="bg-teal mb-3" :to="`/dashboard/user/${state.newStore.userId}`" block>مشاهده کاربر</v-btn>
                            </div>
                            <v-text-field label="عنوان فروشگاه*" density="compact" variant="outlined" class="mb-2"
                                v-model="state.newStore.title" :rules="validator.title"
                                :readonly="state.store.isLocked"></v-text-field>

                            <v-text-field label="شعار فروشگاه*" class="mb-2" density="compact" variant="outlined"
                                counter="25" v-model="state.newStore.slogan" :rules="validator.slogan"
                                :readonly="state.store.isLocked"></v-text-field>

                            <v-text-field label="آدرس فروشگاه*" class="mb-2" density="compact" variant="outlined"
                                :rules="validator.address" v-model="state.newStore.address"
                                :readonly="state.store.isLocked"></v-text-field>

                            <v-textarea label="توضیحات*" class="mb-2" density="compact" variant="outlined" counter="100"
                                v-model="state.newStore.description" rows="2" :rules="validator.description"
                                :readonly="state.store.isLocked"></v-textarea>

                            <v-select v-if="route.params.storeaction == 'edit'" variant="outlined" density="compact" :prependIcon="state.newStore.status == 1 ? 'mdi-lightbulb-outline text-red rounded pa-3' : 'mdi-lightbulb text-green rounded pa-3'"
                                :items="[{id:1,title:'تایید نشده'},{id:2,title:'تایید شده'}]" item-value="id"
                                title="title" v-model="state.newStore.status" label="تائید فروشگاه" />

                            <v-checkbox v-if="route.params.storeaction == 'edit'" v-model="state.newStore.isLocked" hide-details
                                :prependIcon="state.newStore.isLocked ? 'mdi-lock text-red rounded pa-3' : 'mdi-lock-open text-green rounded pa-3'" label="قفل ویرایش اطلاعات فروشگاه" />
                            <v-btn class="bg-blue" type="submit" block>ذخیره</v-btn>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-form>


    <s-dialog v-model="state.dialog" size="xl" title="انتخاب کاربر">
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
                        <v-btn class="bg-blue" @click="handleNewUser(user)">انتخاب</v-btn>
                    </td>
                </tr>
            </tbody>
        </v-table>
        <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="getUsers"></v-pagination>
    </s-dialog>
</template>