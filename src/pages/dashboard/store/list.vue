<script setup>
import storeApi from '@/services/api/store/storeApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  stores: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  store: {
    id: 0,
    title: null,
  },
  searchFilters: [],
  dialog: false,
  advanceDialog:false,
  isActiveFilter:null,
  isDeletedFilter: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'فروشگاه ها ',
      to: '/dashboard/store/list',
    }, ...b])
}

const getStores = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [],
    deleted: route.query.deleted == "true" ? true : false ?? false,
  }
  if (route.query.search) payload.searchFilters.push({ field: "title", operator: 6, value: route.query.search })
  if (route.query.isActive) payload.searchFilters.push({ field: "status", operator: 0, value: route.query.isActive })
  const { data, metadata } = await storeApi.list(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.stores = data
  state.metadata = metadata
}

const recoverStore = async (storeId) =>{
  await storeApi.recover(storeId)
  .then(res => {
      notification.success('بازیابی فروشگاه انجام شد')
      getStores()
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const changePageing = () => {
  let path = '/dashboard/store/list'
  let query = null
  if(state.metadata.pageSize) query = {...query, size: state.metadata.pageSize}
  if(state.metadata.pageIndex) query = {...query, index: state.metadata.pageIndex}
  if(state.searchFilters.value && state.searchFilters.value != '') query = {...query, search: state.searchFilters.value}
  if(state.isDeletedFilter == true || state.isDeletedFilter == false)  query = {...query, deleted:state.isDeletedFilter }
  if(state.isActiveFilter) query = {...query , isActive:state.isActiveFilter}

  router.replace({ path, query })
  setTimeout(() => {
    getStores()
  }, 50);
}

const approveStore = async (id) => {
  await storeApi.approve(id)
    .then(res => {
      notification.success('بروزرسانی انجام شد')
      getStores()
    })
    .catch(erorr => notification.apiError(erorr?.data?.messages))
}

const handleDelete = (store) => {
  state.store = {
    id: store.id,
    title: store.title,
  }
  state.dialog = true
}

const deleteStore = async (id) => {
  await storeApi.delete(id)
    .then(res => {
      notification.success('حذف فروشگاه انجام شد')
      getStores()
    })
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.dialog = false

}

setBreadCrumb()
getStores()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>فروشگاه ها</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <!-- <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify" class="me-5"></v-text-field>
    </v-form>
    <v-select v-model="state.isActiveFilter" @update:model-value="changePageing" variant="outlined"
      :items="[{title:'همه',id:null},{title:'تایید نشده',id:1},{title:'تایید شده',id:2}]" item-value="id"
      item-title="title" density="compact" label="نوع فروشگاه" hide-details class="me-5"></v-select>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="me-5"></v-select> -->
    <v-dialog v-model="state.advanceDialog" transition="dialog-bottom-transition" class="w-50">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn append-icon="mdi-cog" size="small" text="جستجوی پیشرفته" class="ma-0 rounded-0 h-100"
          v-bind="activatorProps"></v-btn>
      </template>

      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="state.advanceDialog = !state.advanceDialog"></v-btn>
          <v-toolbar-title>جستجوی پیشرفته</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two" subheader class="my-10">
          <v-list-item>
            <v-form @submit.prevent="changePageing" style="display: contents;">
              <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact"
                label="جستجو" hide-details @click:append-inner="changePageing"
                append-inner-icon="mdi-magnify"></v-text-field>
            </v-form>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
              label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.isActiveFilter" @update:model-value="changePageing" variant="outlined"
              :items="[{ title: 'همه', id: null }, { title: 'تایید نشده', id: 1 }, { title: 'تایید شده', id: 2 }]" item-value="id"
              item-title="title" density="compact" label="نوع فروشگاه" hide-details class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.isDeletedFilter"
              :items="[{ id: true, title: 'حذف شده' }, { id: false, title: 'حذف نشده' }]" variant="outlined"
              density="compact" label="وضعیت" item-title="title" item-value="id" hide-details
              @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" to="/dashboard/store/add/">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>






  <v-card>
    <v-table>
      <thead>
        <tr>
          <th></th>
          <th><strong>عنوان فروشگاه</strong></th>
          <th class="text-center"><strong>نام فروشنده</strong></th>
          <th class="text-center" v-if="route.query.deleted != 'true'"><strong>وضعیت</strong></th>
          <th class="text-center" v-if="route.query.deleted != 'true'"><strong>قفل ویرایش</strong></th>
          <th><strong></strong></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(store, i) in state.stores" :key="store.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ store.title }}</td>
          <td class="text-center">{{ `${store.firstName} ${store.lastName}` }}</td>
          <td class="text-center" v-if="route.query.deleted != 'true'"><v-chip variant="text"
              :class="store.status == 2 ? 'text-green' : 'text-red'"><v-icon>{{ store.status == 2 ? 'mdi-lightbulb' :
                'mdi-lightbulb-outline' }}</v-icon></v-chip></td>
          <td class="text-center" v-if="route.query.deleted != 'true'"><v-chip variant="text" :class="store.isLocked ? 'text-red' : 'text-green'"><v-icon>{{
                store.isLocked ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon></v-chip></td>
          <td>
            <div class="float-left d-flex ga-1" v-if="!store.deleted">
              <v-btn variant="text" class="text-teal" icon="mdi-tshirt-crew-outline"
                :to="'/dashboard/store/' + store.id + '/storeproduct/list'"></v-btn>
              <v-btn variant="text" class="text-green" icon="mdi-check" @click="approveStore(store.id)"
                :disabled="store.status == 2"></v-btn>
              <v-btn variant="text" class="text-orange" :to="'/dashboard/store/edit/' + store.id"
                icon="mdi-pen"></v-btn>
              <v-btn variant="text" class="text-red" @click="handleDelete(store)" icon="mdi-delete"></v-btn>
            </div>
            <div class="float-left d-flex ga-1" v-else>
              <v-btn variant="text" class="text-blue" icon="mdi-plus-box" @click="recoverStore(store.id)"></v-btn>
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


  <Sdialog v-model="state.dialog" title="حذف فروشگاه" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> فروشگاه <strong>{{ state.store.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
          عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteStore(state.store.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>
