<script setup>
import ProductApi from '@/services/api/store/productApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const state = reactive({
  products: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  product: {
    id: 0,
    title: null,
  },
  searchFilters: [],
  dialog: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'محصولات ',
      to: '/dashboard/product/list',
    }, ...b])
}

const getProducts = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
  }
  const { data, metadata } = await ProductApi.list(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.products = data
  state.metadata = metadata
}

const changePageing = () => {
  if (state.searchFilters.value && state.searchFilters.value != '') {
    router.replace({ path: '/dashboard/product/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
  } else {
    router.replace({ path: '/dashboard/product/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getProducts()
  }, 50);
}

const handleDelete = (product) => {
  state.product = {
    id: product.id,
    title: product.title,
  }
  state.dialog = true
}

const deleteProduct = async (id) => {
  await ProductApi.delete(id)
    .then(res => res.data)
    .catch(erorr => notification.apiError(erorr?.data?.messages))
  state.dialog = false
  getProducts()
}

setBreadCrumb()
getProducts()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>محصولات</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو"
        hide-details @click:append-inner="changePageing" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form>
    <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
      label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="px-5"></v-select>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" to="/dashboard/product/add/"><v-icon
        class="pa-1">mdi-plus</v-icon></v-btn>

  </v-toolbar>

  <v-card>
    <v-table>
      <thead>
        <tr>
          <th><strong>ردیف</strong></th>
          <th><strong>عنوان</strong></th>
          <th><strong>دسته بندی</strong></th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(product, i) in state.products" :key="product.id">
          <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) + 1 }}</td>
          <td>{{ product.title }}</td>
          <td>
            <v-chip>{{ product.category?.title }}</v-chip>
          </td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn class="text-orange" variant="text" :to="'/dashboard/product/edit/' + product.id"
                icon="mdi-pen"></v-btn>
              <v-btn class="text-red" @click="handleDelete(product)" icon="mdi-delete" variant="text"></v-btn>
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


  <Sdialog v-model="state.dialog" title="حذف محصول" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mb-3"> محصول <strong>{{ state.product.title }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
          عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteProduct(state.product.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>
