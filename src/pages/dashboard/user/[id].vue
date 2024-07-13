<script setup>
import dateConverter from "@/composables/dateConverter"
import datePicker from 'vue3-persian-datetime-picker'
import userApi from '@/services/api/identityServices/userApi';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const verifyForm = ref({});
const route = useRoute()
const state = reactive({
  tab:1,
  user: {
    userId: 0,
    name: null,
    family: null,
    gender: 1,
    birthDate: null,
    nationalCode: null,
    shebaCode: null,
    nationalCardImage: null,
    isLocked: false,
    isAccepted: false,
    imageId: null
  },
  roles:null,
  userName:null,
  nationalCardImageError:false,
  imageError:false,
})

const storeStatus = [
  {
    id:1,
    title:"در انتظار تأیید",
  },
  {
    id:2,
    title:"تأیید شده",
  },
  {
    id:3,
    title:"رد شده",
  },
  {
    id:4,
    title:"قفل شده",
  }]

const userRoles = [
  {
    id:'superadmin',
    title: 'سوپر ادمین'
  },
  {
    id:'seller',
    title:'فروشنده'
  }
]

const getUser = async () => {
  const { data } = await userApi.getById(route.params.id)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.user = data
  state.userName = `${state.user.firstName} ${state.user.lastName}`
  state.roles = userRoles.filter(x=> state.user.roles.find(y=>y == x.id)).map(z=>z.title)
  state.user.imageId = state.user.image
  dashboardbreadcrumbstore().setBreadCrumbs([
  {
      title: 'کاربران',
      to: '/dashboard/user/list',
    },
    {
      title: `${state.user.firstName} ${state.user.lastName}`,
    },
  ])
}

const validator = {
  name: [(value) => value ? true : 'وارد کردن نام اجباری است'],
  family: [(value) => value ? true : 'وارد کردن نام خانوادگی اجباری است'],
  birthDate: [(value) => value ? true : 'وارد کردن تاریخ تولد اجباری است'],
  nationalCode: [(value) => {
        if(!value) return "وارد کردن کدملی اجباری است."
        if(value.length != 10) return "کدملی 10 رقم است"
        return true
    }],
  shebaCode: [(value) => {
        if(!value) return "وارد کردن شماره شبا اجباری است."
        if(value.length != 26) return "شماره شبا 24 رقم است"
        return true
    }],
};

const editUserMeta = async () =>{
  const { valid } = await verifyForm.value.validate()
  if(valid && state.user.meta.nationalCardImage && state.user.imageId){
    const payload = {
      userId: state.user.meta.userId,
      firstName:  state.user.meta.firstName,
      lastName:  state.user.meta.lastName,
      gender:  state.user.meta.gender,
      birthDate:  state.user.meta.birthDate,
      nationalCode:  state.user.meta.nationalCode,
      shebaCode:  state.user.meta.shebaCode,
      nationalCardImage:  state.user.meta.nationalCardImage,
      isLocked:  state.user.meta.isLocked,
      isAccepted:  state.user.meta.isAccepted,
      imageId: state.user.imageId
    }
    await userApi.edit(payload)
    .then(notification.success('ویرایش با موفقیت همراه بود'))
    .catch(e=>notification.apiError(e?.data?.messages))
    return
  }
  state.nationalCardImageError = true
  state.imageError = true
}

getUser()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title><h2>{{state.userName}}</h2></v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>

  <v-tabs v-model="state.tab" align-tabs="center" class="mb-3">
    <v-tab :value="1">اطلاعات کاربری</v-tab>
    <v-tab :value="2" v-if="state.user.spouses && state.user.spouses.length > 0">اطلاعات همسر</v-tab>
    <v-tab :value="3" v-if="state.user.spouses && state.user?.spouses?.find(x=>x)?.children && state.user?.spouses?.find(x=>x)?.children?.length > 0">اطلاعات فرزندان</v-tab>
    <v-tab :value="4" v-if="state.user.store">اطلاعات فروشگاه</v-tab>
    <v-tab :value="5" v-if="state.user.meta">ویرایش اطلاعات هویتی</v-tab>
  </v-tabs>

  <v-window v-model="state.tab">

    <v-window-item :value="1">
      <v-row>
        <v-col cols="12" md="4">
          <v-card flat>
            <v-card-title>
              عکس کاربری
            </v-card-title>
            <v-divider class="my-3"></v-divider>
            <v-card-text class="text-center">
              <s-image :src="state.user.image" class="rounded" style="max-width: 200px;" />
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card flat>
            <v-card-title>
              اطلاعات کاربری
            </v-card-title>
            <v-divider class="my-3"></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="6">
                  <p>{{ 'نام: ' + state.user.firstName }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'نام خانوادگی: ' + state.user.lastName }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'شماره تماس: '+ state.user.phoneNumber }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'تاریخ تولد: '+ dateConverter.convertToJalali(state.user.birthDate) }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'جنسیت: '+ (state.user.gender == 1 ? 'مرد' : 'زن') }}</p>
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              <v-row>
                <v-col cols="6">
                  <p>{{ 'ثبت نام شده است؟: ' + (state.user.isRegistered ? 'بله' : 'خیر') }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'حساب کاربری فعال است؟: ' + (state.user.isActive ? 'بله' : 'خیر') }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'حساب کاربری تکمیل شده است؟: ' + (state.user.isProfileCompleted ? 'بله' : 'خیر') }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'همسر دارد؟: ' + (state.user.hasSpouse ? 'بله' : 'خیر') }}</p>
                </v-col>
                <v-col cols="6">
                  <p>{{ 'فرزند دارد؟: ' + (state.user.hasChild ? 'بله' : 'خیر') }}</p>
                </v-col>
              </v-row>
              <v-divider class="my-3"></v-divider>
              <v-row v-if="state.roles">
                <v-col cols="6">
                  <p>{{ 'نقش ها: ' + state.roles }}</p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-window-item>

    <v-window-item :value="2">
      <template v-if="state.user.spouses && state.user.spouses.length > 0">
        <v-row>
          <v-col cols="12" md="4">
          </v-col>

          <v-col cols="12" md="8">
            <v-card class="mt-3" flat>
              <v-card-title>اطلاعات همسر</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <p>{{ 'نام و نام خانوادگی: ' + state.user.spouses.find(x=>x).fullName }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-window-item>

    <v-window-item :value="3">
      <template v-if="state.user.spouses && state.user.spouses.find(x=>x).children && state.user.spouses.find(x=>x).children.length > 0">
        <v-row>
          <v-col cols="12" md="4">
          </v-col>

          <v-col cols="12" md="8">
            <v-card class="mt-3" flat>
              <v-card-title>اطلاعات فرزندان</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-list v-for="child in state.user.spouses.find(x=>x).children" :key="child.id">
                  <v-list-item>
                    <v-row>
                      <v-col cols="6">
                        <p>{{ 'نام فرزند: ' + child.name }}</p>
                      </v-col>
                      <v-col cols="6">
                        <p>{{ 'تاریخ تولد: ' + child.birthDate }}</p>
                      </v-col>
                      <v-col cols="6">
                        <p>{{ 'جنسیت: ' + (child.gender == 1 ? 'پسر' : 'دختر') }}</p>
                      </v-col>
                    </v-row>
                    <v-divider></v-divider>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-window-item>

    <v-window-item :value="4">
      <template  v-if="state.user.store">
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="mt-3" flat>
              <v-card-title>عکس فروشگاه</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <s-image :src="state.user.store.image" class="rounded mx-auto" style="max-width: 200px;" />
              </v-card-text>
            </v-card>
            <v-card class="mt-3" flat>
              <v-card-title>لوگو فروشگاه</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="text-center">
                <s-image :src="state.user.store.logo" class="rounded mx-auto" style="max-width: 200px;" />
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <v-card class="mt-3" flat>
              <v-card-title>عنوان فروشگاه</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-row>
                  <v-col cols="6">
                    <p>{{ 'عنوان فروشگاه: ' + state.user.store.title }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p>{{ 'تاریخ تولد: '+ dateConverter.convertToJalali(state.user.birthDate) }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p>{{ 'جنسیت: '+ (state.user.gender == 1 ? 'مرد' : 'زن') }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p>{{ 'آدرس: ' + state.user.store.address }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p>{{ 'شعار: '+ state.user.store.slogan }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p>{{ 'توضیحات: '+ state.user.store.description }}</p>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6">
                    <p>{{ 'وضعیت: ' + storeStatus.find(y=>y.id == state.user.store.status).title }}</p>
                  </v-col>
                  <v-col cols="6">
                    <p>{{ 'قفل: ' + (state.user.isLocked ? 'بله' : 'خیر') }}</p>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-divider></v-divider>
              <v-card-text>
                <v-btn class="bg-orange text-white border-none" block :to="`/dashboard/store/edit/${state.user.store.id}`">رفتن به ویرایش فروشگاه</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-window-item>

    <v-window-item :value="5">
      <template v-if="state.user.meta">
        <v-form @submit.prevent="editUserMeta" ref="verifyForm">
          <v-row>
            <v-col cols="12" md="4">
              <v-row>
                <v-col cols="6" md="12">
                  <v-card class="mt-3" flat>
                    <v-card-title>عکس کاربری</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="text-center">
                      <s-uploader v-model="state.user.imageId" class="rounded mx-auto" style="max-width: 200px;"></s-uploader>
                      <span class="text-red" v-if="state.imageErrorimageError">وارد کردن عکس پروفایل الزامی است</span>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="6" md="12">
                  <v-card class="mt-3" flat>
                    <v-card-title>عکس کارت ملی</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text class="text-center">
                      <s-uploader v-model="state.user.meta.nationalCardImage" class="rounded mx-auto" style="max-width: 200px;"></s-uploader>
                      <span class="text-red" v-if="state.nationalCardImageError">وارد کردن عکس کارت ملی الزامی است</span>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>

            <v-col cols="12" md="8">
              <v-card flat class="mt-3">
                <v-card-title>اطلاعات هویتی</v-card-title>
                <v-divider></v-divider>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" lg="6">
                      <v-text-field v-model="state.user.meta.firstName" variant="outlined" density="compact" :rules="validator.name"
                        label="نام"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6">
                      <v-text-field v-model="state.user.meta.lastName" variant="outlined" density="compact" :rules="validator.family"
                        label="نام خانوادگی"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6">
                      <v-text-field v-model="state.user.meta.nationalCode" variant="outlined" density="compact" dir="ltr" :rules="validator.nationalCode" counter="10"
                        label="کد ملی"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6">
                      <v-text-field v-model="state.user.meta.shebaCode" variant="outlined" density="compact" dir="ltr" :rules="validator.shebaCode" counter="26" label="شماره شبا"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6">
                      <date-picker v-model="state.user.meta.birthDate" custom-input="#birthday" format="YYYY-MM-DD" display-format="jYYYY-jMM-jDD" view="year" :wrapper-submit="true" auto-submit></date-picker>
                      <v-text-field id="birthday" variant="outlined" placeholder="تاریخ تولد*" density="compact" prepend-inner-icon="mdi-calendar" dir="ltr" :value="dateConverter.convertToJalali(state.user.meta.birthDate)"></v-text-field>
                    </v-col>
                    <v-col cols="12" lg="6">
                      <v-btn-toggle v-model="state.user.gender" divided class="w-100 mt-1 mb-4" color="info" variant="outlined" density="compact">
                        <v-btn title="مرد" class="w-50" :value="1">مرد</v-btn>
                        <v-btn title="زن" class="w-50" :value="2">زن</v-btn>
                      </v-btn-toggle>
                    </v-col>
                    <v-col cols="12" lg="6" class="d-flex ga-5 align-center">
                      <label class="d-flex ga-3"><v-icon>mdi-lock-outline</v-icon><span>قفل ویرایش اطلاعات</span></label>
                      <v-radio-group inline v-model="state.user.meta.isLocked" hide-details>
                        <v-radio label="فعال" :value="true"></v-radio>
                        <v-radio label="غیرفعال" :value="false"></v-radio>
                      </v-radio-group>
                    </v-col>
                    <v-col cols="12" lg="6" class="d-flex ga-5 align-center">
                      <label class="d-flex ga-3"><v-icon>mdi-account-check-outline</v-icon><span>تایید اطلاعات هویتی</span></label>
                      <v-radio-group inline v-model="state.user.meta.isAccepted" hide-details>
                        <v-radio label="بله" :value="true"></v-radio>
                        <v-radio label="خیر" :value="false"></v-radio>
                      </v-radio-group>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                  <v-btn class="bg-orange text-white" block type="sumbit">ذخیره تغییرات</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </template>
    </v-window-item>
  </v-window>
</template>
