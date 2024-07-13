<script setup>
import userApi from '@/services/api/identityServices/userApi';
import categoriesApi from "@/services/api/yarServices/categoriesApi";
import expertApi from "@/services/api/yarServices/expertApi"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js";
import notification from "@/utils/notification.js";
const verifyForm = ref({});
const router = useRouter()
const route = useRoute()
const state = reactive({
  users: [],
  user: null,
  expert: null,
  newExpert: {
    userId: 0,
    counselingAmount: 0,
    expertise: null,
    medicalNumber: 0,
    description: null,
    grade: 3,
    isConfirm: true,
    isLocked: true,
    specialtyIds: [],
    documentIds: []
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
  search: '',
  userName: null,
  documentIdsError: false,
  dialog: false,
})

const gradeConstract =
  [
    {
      id: 3,
      title: "کارشناسی",
    },
    {
      id: 4,
      title: "کارشناسی ارشد",
    },
    {
      id: 5,
      title: "دکترا",
    },
  ]

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'متخصصان',
      to: '/dashboard/expert/list',
    },
    ...b])
}

const getCategories = async () => {
  const { data } = await categoriesApi.getAll()
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.categories = data.filter(x => !x.hasChild)
}

const getExpert = async () => {
  const { data } = await expertApi.getById(route.params.id)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.newExpert = { ...data }
  setBreadCrumb([
    { title: `${state.newExpert.firstName} ${state.newExpert.lastName}` }
  ])
}

const getUsers = async () => {
  const payload = {
    pageSize: state.metadata.pageSize,
    pageIndex: state.metadata.pageIndex,
    search: state.search,
  }
  const { data, metadata } = await userApi.getAll(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.users = data
  state.metadata = metadata
}

const handleNewUserDialog = () => {
  state.dialog = !state.dialog
  getUsers()
}

const handleNewUser = (user) => {
  state.newExpert.userId = user.id
  state.user = { ...user }
  state.userName = `${state.user.firstName} ${state.user.lastName}`
  state.dialog = false
}

const uploadImage = (id) => {
  state.newExpert.documentIds.push(id)
  state.documentIdsError = false
}

const deleteUploadedImage = (id) => {
  state.newExpert.documentIds = state.newExpert.documentIds.filter(x => x != id);
}

const add = async () => {
  await expertApi.add(state.newExpert)
    .then(res => {
      notification.success('افزودن انجام شد')
      router.push(`/dashboard/expert/edit/${res.data}`)
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const edit = async () => {
  await expertApi.edit(state.newExpert)
    .then(res => notification.success('ویرایش انجام شد'))
    .catch(e => notification.apiError(e?.data?.messages))
}

const save = async () => {
  const { valid } = await verifyForm.value.validate()
  if (!state.newExpert.documentIds.length > 0) state.documentIdsError = true
  if (valid && !state.documentIdsError) {
    if (state.newExpert.id > 0)
      await edit();
    else
      await add()
  }
}

const validator = {
  counselingAmount: [(value) => value ? true : 'وارد کردن قیمت مشاوره فی جلسه اجباری است'],
  medicalNumber: [(value) => value ? true : 'وارد کردن کد نظام پزشکی اجباری است'],
  description: [(value) => value ? true : 'وارد کردن شعار اجباری است'],
  grade: [(value) => value ? true : 'وارد کردن تحصیلات اجباری است'],
  specialtyIds: [(value) => value ? true : 'وارد کردن دسته بندی اجباری است'],
  expertise: [(value) => value ? true : 'وارد کردن عنوان تخصص اجباری است'],
};

setBreadCrumb()
getCategories()
if (route.params.id) {
  getExpert()
}else{
  setBreadCrumb([
    { title: 'افزودن متخصص' }
  ])
}
</script>
<template>
  <v-toolbar class="mb-3 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>{{ route.params.id ? 'ویرایش' : 'افزودن متخصص جدید' }}</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-form @submit.prevent="save" ref="verifyForm">
    <v-card class="mb-3" flat v-if="!route.params.id">
      <v-card-title>
        انتخاب کاربر
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <div class="d-flex ga-1 mb-2">
          <v-text-field v-model="state.userName" label="نام کاربر" density="compact" variant="outlined" readonly
            hide-details></v-text-field>
          <v-btn @click="handleNewUserDialog" class="text-blue border-none mt-1" icon="mdi-magnify"
            style="border-radius: 5px;" density="comfortable"></v-btn>
        </div>
        <p v-if="!state.user" class="text-red"><v-icon class="mx-1">mdi-alert</v-icon><span>کاربری هنوز انتخاب نشده
            است!</span></p>
      </v-card-text>
    </v-card>

    <v-row>
      <v-col cols="12" md="4">
        <v-card flat>
          <v-card-title>
            عکس پروفایل و مدارک
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text v-if="state.documentIdsError">
            <p class="text-red" v-if="state.documentIdsError"><v-icon class="mx-1">mdi-alert</v-icon><span><small>بارگزاری
                  حداقل یک عکس از مدارک الزامی است!</small></span></p>
          </v-card-text>
          <v-card-text class="text-center">
            <v-btn v-if="state.newExpert.createdOnUtc" class="bg-teal mb-3" block prepend-icon="mdi-star" :href="`/dashboard/user/${state.newExpert.userId}`">رفتن به ویرایش عکس پروفایل</v-btn>
            <s-uploader @update:model-value="uploadImage" :hasImage="false" :multiple="true" text="بارگزاری عکس مدارک"/>
            <div class="my-1 d-flex justify-space-between" v-for="documentId in state.newExpert.documentIds">
              <s-image class="border" :src="documentId" style="max-width: 50px;"/>
              <v-btn class="bg-red rounded" @click="deleteUploadedImage(documentId)" icon="mdi-delete-forever"></v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card flat>
          <v-card-title>
            اطلاعات متخصص
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="6" class="px-1">
                <v-text-field variant="outlined" density="compact" type="text" label="عنوان تخصص"
                  v-model="state.newExpert.expertise" :rules="validator.expertise"></v-text-field>
              </v-col>
              <v-col cols="6" class="px-1">
                <v-text-field variant="outlined" density="compact" type="number" label="قیمت مشاوره فی جلسه"
                  v-model="state.newExpert.counselingAmount" :rules="validator.counselingAmount"></v-text-field>
              </v-col>
              <v-col cols="6" class="px-1 mt-3">
                <v-text-field variant="outlined" density="compact" type="number" label="کد نظام پزشکی"
                  v-model="state.newExpert.medicalNumber" :rules="validator.medicalNumber"></v-text-field>
              </v-col>
              <v-col cols="6" class="px-1 mt-3">
                <v-select variant="outlined" density="compact" type="text" label="تحصیلات" :items="gradeConstract"
                  item-value="id" item-title="title" v-model="state.newExpert.grade"
                  :rules="validator.grade"></v-select>
              </v-col>
              <v-col class="px-1 mt-3">
                <v-textarea row="5" variant="outlined" density="compact" type="text" label="توضیحات"
                  v-model="state.newExpert.description"></v-textarea>
              </v-col>
            </v-row>
            <v-divider class="my-3"></v-divider>
            <v-autocomplete variant="outlined" density="compact" type="text" label="تخصص ها" multiple
              :items="state.categories" item-value="id" item-title="title" v-model="state.newExpert.specialtyIds"
              :rules="validator.specialtyIds" chips></v-autocomplete>
            <v-divider class="my-3"></v-divider>
            <v-row>
              <v-col cols="6">
                <label><strong>تایید</strong></label>
                <v-radio-group inline hide-details v-model="state.newExpert.isConfirm">
                  <v-radio label="بله" :value="true"></v-radio>
                  <v-radio label="خیر" :value="false"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="6">
                <label><strong>قفل</strong></label>
                <v-radio-group inline hide-details v-model="state.newExpert.isLocked">
                  <v-radio label="بله" :value="true"></v-radio>
                  <v-radio label="خیر" :value="false"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-btn class="bg-blue mt-3" block type="submit">ذخیره</v-btn>
      </v-col>
    </v-row>
  </v-form>


  <s-dialog v-model="state.dialog" size="xl" title="انتخاب کاربر">
    <v-text-field v-model="state.search" type="search" variant="outlined" density="compact" label="جستجو" hide-details
      append-inner-icon="mdi-magnify" @keyup.enter="getUsers"></v-text-field>
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
        <tr v-for="(user, i) in state.users" :key="user.id" @click="handleNewUser(user)">
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
