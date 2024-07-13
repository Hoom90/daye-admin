<script setup>
import storeProductApi from '@/services/api/store/storeProductApi.js';
import storeApi from '@/services/api/store/storeApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  storeProducts: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  storeProduct: {
    id: 0,
    title: null,
  },
  store:{
    id:0,
    title:null,
  },
  searchFilters: [],
  dialog: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([{
    title: 'فروشگاه ها ',
    to: '/dashboard/store/list',
  }, ...b])
}

const getStore = async () => {
  const { data } = await storeApi.getById(route.params.storeId)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.store = data
  setBreadCrumb([
    {
      title: state.store.title,
      to: `/dashboard/store/${state.store.id}`,
    }
  ])
}

const getStoreProducts = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
    storeId: route.params.storeId,
  }
  const { data, metadata } = await storeProductApi.list(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.storeProducts = data
  state.metadata = metadata
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: `/dashboard/store/${route.params.storeId}/storeproduct/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: `/dashboard/store/${route.params.storeId}/storeproduct/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getStoreProducts()
  }, 50);
}

const handleDelete = (storeProduct) => {
  state.storeProduct = {
    id: storeProduct.id,
    title: storeProduct.productTitle,
  }
  state.dialog = true
}

const deleteStoreProduct = async (id) => {
  await storeProductApi.delete(id)
    .then(res => {
      notification.success('حذف کالا انجام شد')
      getStoreProducts()
    })
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false

}

getStore()
getStoreProducts()
</script>
<template>
  <v-toolbar class="mb-5 bg-white" elevation="1">
    <v-toolbar-title>
      <h2>محصولات {{ state.store?.title }}</h2>
    </v-toolbar-title>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" class="me-5"
        label="جستجو" hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details class="me-5" @update:modelValue="changePageing"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" :to="`/dashboard/store/${route.params.storeId}/storeproduct/add`">
      <v-icon class="pa-1">mdi-plus</v-icon>
    </v-btn>
  </v-toolbar>

  <v-card flat>
        <v-table>
          <thead>
            <tr>
              <th></th>
              <th><strong>نام محصول</strong></th>
              <th><strong>عنوان</strong></th>
              <th><strong>وضعیت</strong></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(storeProduct, i) in state.storeProducts" :key="storeProduct.id">
              <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
              <td>{{ storeProduct.productTitle }}</td>
              <td>{{ storeProduct.specification }}</td>
              <td><v-chip :class="storeProduct.isActive ? 'bg-green' : 'bg-red'">{{ storeProduct.isActive ? 'فعال' : 'غیرفعال' }}</v-chip></td>
              <td>
                <div class="float-left d-flex ga-1">
                  <v-btn class="text-orange border-none" :to="`/dashboard/store/${route.params.storeId}/storeproduct/edit/${storeProduct.id}`" icon="mdi-pen" style="border-radius: 5px;"></v-btn>
                  <v-btn class="text-red border-none" @click="handleDelete(storeProduct)" icon="mdi-delete"
                    style="border-radius: 5px;"></v-btn>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
      <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex"
        @update:modelValue="changePageing"></v-pagination>
  </v-card>


  <Sdialog v-model="state.dialog" title="حذف کالا" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> کالا <strong>{{ state.storeProduct.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
          عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteStoreProduct(state.storeProduct.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>