<script setup>
import attributeApi from '@/services/api/store/attributesApi';
import attributeValuesApi from '@/services/api/store/attributeValuesApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const verifyForm = ref({});
const route = useRoute()
const state = reactive({
    attribute: {
        values:[],
    },
    value:{
      id:0,
      value:null,
    },
    searchFilters: [],
    dialog: false,
    isDelete: false,
    isEdit: false,
})

const getAttribute = async () => {
  const { data } = await attributeApi.getById(route.params.id)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.attribute = data
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'ویژگی ها ',
      to: '/dashboard/attribute/list',
    },
    {
      title: state.attribute.title,
    },])
}

const add= async () =>{
  let payload = {
    value: state.value.value,
    attributeId: state.attribute.id,
  }
  await attributeValuesApi.add(payload)
    .then(notification.success('افزودن موفق'))
    .catch((e) => notification.apiError(e?.data?.messages))
    state.dialog = false
    getAttribute()
}

const edit = async () =>{
  let payload = {
    id: state.value.id,
    value: state.value.value,
    attributeId: state.attribute.id,
  }
  await attributeValuesApi.edit(payload)
    .then(notification.success('ویرایش موفق'))
    .catch((e) => notification.apiError(e?.data?.messages))
    state.dialog = false
    getAttribute()
}

const deleteValue = async (id) => {
  await attributeValuesApi.delete(id)
    .then(notification.success('حذف موفق'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getAttribute()
}

const handleAdd = () =>{
  state.isDelete = false
  state.isEdit = false
  state.value = {
    id:null,
    value:null,
  },
  state.dialog = true
}

const handleEdit = (value) =>{
  state.isDelete = false
  state.isEdit = true
  state.value = {...value},
  state.dialog = true
}

const handleDelete = (value) => {
  state.value = {...value}
  state.isDelete =true
  state.dialog = true
}

const save = async () =>{
  const { valid } = await verifyForm.value.validate()
  if(valid){
    if(state.value.id > 0)
      edit()
    else
      add()
  }
}

const validator = {
    value: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
};

getAttribute()
</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>{{  `ویژگی های ${state.attribute.title}` }}</h2>
    </v-toolbar-title>
    <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handleAdd"><v-icon>mdi-plus</v-icon></v-btn>
  </v-toolbar>

  <v-card>
    <v-table>
      <tbody>
        <tr v-for="(prop, i) in state.attribute.values" :key="prop.id">
          <td>{{ i+1 }}</td>
          <td>{{ prop.value }}</td>
          <td>
            <div class="float-left d-flex ga-1">
              <v-btn variant="text" class="text-orange" icon="mdi-pen" @click="handleEdit(prop)"></v-btn>
              <v-btn variant="text" class="text-red" @click="handleDelete(prop)" icon="mdi-delete"></v-btn>
            </div>
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-card>

  <Sdialog v-model="state.dialog" :title="state.isDelete ? 'حذف' : state.isEdit ? 'ویرایش' : 'افزودن'" size="xs">
    <template v-if="!state.isDelete">
      <v-form @submit.prevent="save" ref="verifyForm">
          <v-card flat>
            <v-card-text>
              <v-text-field v-model="state.value.value" variant="outlined" label="عنوان*" density="compact" :rules="validator.value"></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
              <v-btn class="bg-blue w-50" type="submit">تایید</v-btn>
            </v-card-actions>
          </v-card>
      </v-form>
    </template>
    <template v-else>
      <v-card flat>
        <v-card-text>
          <p class="mb-3"><strong>{{ state.value.value }}</strong> حذف می شود. <br /> آیا مطمئن هستید؟
            عملیات حذف غیر قابل بازگشت است!</p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deleteValue(state.value.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </Sdialog>
</template>
