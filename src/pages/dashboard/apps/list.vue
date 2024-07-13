<script setup>
import appApi from '@/services/api/baseServices/appApi.js';
// import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"

// const verifyForm = ref({});
const state = reactive({
    apps: [],
    app: {
        title: null,
        accountNumber: null,
        bankGatewayToken: null
    },

    dialog: false,
    deleteDialog: false,
    actionDialog: false,
    dialogTitle: null,
})

const getApps = async () => {
    state.apps = await appApi.getAll()
        .then(res => res.data)
        .catch(e => notification.apiError(e?.data?.messages))
        dashboardbreadcrumbstore().setBreadCrumbs([{
            title: 'برنامه ها ',
        }])
}

// const save = async (values) => {
//     const { valid } = await verifyForm.value.validate()
//     if (!valid) {
//         notification.error('فرم را کامل کنید')
//         return
//     }

//     if (state.app.id > 0)
//         await edit();
//     else
//         await add()
// }

// const add = async () => {
//     await appApi.add(state.app)
//         .then(res => notification.success('دسته ایجاد شد'))
//         .catch(erorr => notification.apiError(erorr?.data?.messages))
//     state.actionDialog = false
//     state.dialog = false
//     getApps()
// }

// const edit = async () => {
//     await appApi.edit(state.app)
//         .then(res => notification.success('دسته ویرایش شد'))
//         .catch(erorr => notification.apiError(erorr?.data?.messages))
//     state.actionDialog = false
//     state.dialog = false
//     getApps()
// }

// const deleteApp = async (id) => {
//     await appApi.deleteById(id)
//         .then(res => res.data)
//         .catch(erorr => notification.apiError(erorr?.data?.messages))
//     state.dialog = false
//     state.deleteDialog = false
//     getApps()
// }

// const handelAddEditDialog = (app) => {
//     if (app) {
//         state.app = {
//             id: app.id,
//             title: app.title,
//             accountNumber: app.accountNumber,
//             bankGatewayToken: app.bankGatewayToken
//         }
//         state.dialogTitle = "ویرایش"
//     }
//     else {
//         state.dialogTitle = 'افزودن'
//         state.app.id = null
//         state.app.title = null
//         state.app.accountNumber = null
//         state.app.bankGatewayToken = null
//     }
//     state.actionDialog = true
//     state.dialog = true
// }

// const handleDelete = (app) => {
//     state.app = {
//         id: app.id,
//         title: app.title,
//     }
//     state.dialogTitle = "حذف"
//     state.deleteDialog = true
//     state.dialog = true
// }

// const validator = {
//     title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
//     accountNumber: [(value) => value ? true : "وارد کردن شماره حساب اجباری است."],
//     bankGatewayToken: [(value) => value ? true : "وارد کردن آدرس درگاه پرداخت اجباری است."],
// };

getApps()
</script>
<template>
    <v-toolbar class="mb-5 bg-white" elevation="1">
        <v-toolbar-title>
            <h2>برنامه ها</h2>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <!-- <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handelAddEditDialog()">
            <v-icon class="pa-1">mdi-plus</v-icon>
        </v-btn> -->
    </v-toolbar>

    <v-card>
        <v-table>
            <thead>
                <tr>
                    <th class="text-center"><strong>ردیف</strong></th>
                    <th class="text-center"><strong>عنوان</strong></th>
                    <th class="text-center"><strong>شماره حساب</strong></th>
                    <th class="text-center"><strong>درگاه اختصاصی</strong></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(app, i) in state.apps" :key="app.id">
                    <td class="text-center">{{ i + 1 }}</td>
                    <td class="text-center">{{ app.title }}</td>
                    <td class="text-center">
                        <v-chip v-if="app.appCategoriesIds?.length > 0" :class="app.accountNumber ? 'bg-green' : 'bg-red'">{{ `${app.accountNumber ? 'دارد' : 'ندارد'}` }}</v-chip>
                    </td>
                    <td class="text-center">
                        <v-chip v-if="app.appCategoriesIds?.length > 0" :class="app.bankGatewayToken ? 'bg-green' : 'bg-red'">{{ `${app.bankGatewayToken ? 'دارد' : 'ندارد'}` }}</v-chip>
                    </td>
                    <td>
                        <div class="float-left d-flex ga-1" v-if="app.categoryIds?.length > 0">
                            <v-btn variant="text" class="text-teal" :to="`options/${app.id}`" icon="mdi-wrench"></v-btn>
                            <!-- <v-btn variant="text" class="text-orange" @click="handelAddEditDialog(app)" icon="mdi-pen"
                                disabled></v-btn> -->
                            <!-- <v-btn variant="text" class="text-red" @click="handleDelete(app)" icon="mdi-delete"
                                disabled></v-btn> -->
                        </div>
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-card>

    <!-- <Sdialog v-model="state.dialog" :title="state.dialogTitle + ' برنامه '" size="xs"
        @update:modelValue="state.actionDialog = false; state.deleteDialog = false">

        <template v-if="state.actionDialog">
            <v-form @submit.prevent="save" ref="verifyForm">
                <v-card flat>
                    <v-card-text>
                        <v-text-field class="mb-3" density="compact" variant="outlined" label="عنوان" autofocus
                            v-model="state.app.title" :rules="validator.title"></v-text-field>

                        <v-text-field class="mb-3" density="compact" variant="outlined" label="شماره حساب"
                            v-model="state.app.accountNumber" :rules="validator.accountNumber"></v-text-field>

                        <v-text-field class="mb-3" density="compact" variant="outlined" label="آدرس درگاه پرداخت"
                            v-model="state.app.bankGatewayToken" :rules="validator.bankGatewayToken"></v-text-field>

                    </v-card-text>
                    <v-card-actions>
                        <v-btn class="border w-50"
                            @click="state.actionDialog = !state.actionDialog; state.dialog = false">لغو</v-btn>
                        <v-btn class="bg-blue w-50" type="submit">تایید</v-btn>
                    </v-card-actions>
                </v-card>
            </v-form>
        </template>

<template v-if="state.deleteDialog">
            <v-card flat>
                <v-card-text>
                    <p class="mb-3"> دسته <strong>{{ state.app.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
                        عملیات حذف غیر قابل بازگشت است!</p>
                </v-card-text>
                <v-card-actions>
                    <v-btn class="border w-50"
                        @click="state.deleteDialog = !state.deleteDialog; state.dialog = !state.dialog">انصراف</v-btn>
                    <v-btn class="bg-red w-50" @click="deleteApp(state.app.id)">تایید</v-btn>
                </v-card-actions>
            </v-card>
        </template>
</Sdialog> -->
</template>