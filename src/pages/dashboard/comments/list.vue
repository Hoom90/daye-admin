<script setup>
const DAYEYAR_LINK = import.meta.env.VITE_DAYEYAR_LINK
const STORE_LINK = import.meta.env.VITE_STORE_LINK
import commentsApi from '@/services/api/baseServices/commentsApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
import dateConverter from '@/composables/dateConverter';
const route = useRoute()
const router = useRouter()
const state = reactive({
  comments: [],
  selectedComment: null,
  newComment: {
    id: null,
    message: null,
    parentId: null,
    publishStatus: null,
  },
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  parentId:null,
  appId:null,
  targetType:null,
  searchFilters: [],
  targetName: null,
  dialog: false,
  IsAdd: false,
  IsEdit: false,
})

const storeTargetTypes = [
  {
    title: 'فروشگاه کاربر',
    id:1,
  },
  {
    title: 'محصول فروشگاه کاربر',
    id:2,
  }]

const dayeTargetTypes = [{
  title: 'محتوا',
  id:10,
},
{
  title: 'مشاور',
  id:11,
}]

onMounted(() => {
  getComments()
})

const getComments = async () => {
  let payload = {
    parentId: state.parentId,
    appId: state.appId,
    targetType: state.targetType,
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "user.phoneNumber", operator: 6, value: route.query.search }],
  }
  const { data, metadata } = await commentsApi.getAll(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.comments = data
  state.metadata = metadata
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'نظرات ',
      to: '/dashboard/comments/list',
    }])
}

const getComment = async () =>{
  await commentsApi.getById(state.selectedComment.id)
  .then((res) => {
    state.selectedComment = res.data
    if(state.selectedComment.targetId != 0)
      getCommentTarget()
  })
    .catch((e) => notification.apiError(e?.data?.messages))
}

const getCommentTarget = async () =>{
  let appId = state.selectedComment.appId
  let tagetId = state.selectedComment.targetId
  let targetType = state.selectedComment.targetType
  await commentsApi.getTargetNameByAppId(appId,tagetId,targetType)
  .then(res=> {
    state.targetName = res.title
  })
  .catch((e) => notification.apiError(e?.data?.messages))
}

const changePageing = () => {
  let path = '/dashboard/comments/list'
  let query = null
  if (state.metadata.pageSize) query = { ...query, size: state.metadata.pageSize }
  if (state.metadata.pageIndex) query = { ...query, index: state.metadata.pageIndex }
  if (state.searchFilters.value && state.searchFilters.value != '') query = { ...query, search: state.searchFilters.value }
  if (state.appId) query = { ... query, appId: state.appId }
  if (state.targetType) query = { ... query, targetType: state.targetType }
  router.replace({ path, query })
  setTimeout(() => {
    getComments()
  }, 50);
}

const add = async () => {
  await commentsApi.addComment(state.newComment)
    .then(res => {
      getComments()
      notification.success('پاسخ دادن به کاربر انجام شد')
      getComment(state.newComment.id)
      state.IsAdd = false
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const edit = async () => {
  await commentsApi.editComment(state.newComment)
    .then(res => {
      getComments()
      notification.success('ویرایش انجام شد')
      getComment(state.newComment.id)
      state.IsEdit = false
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const save = async (subComment) => {
  if(subComment.id){
    state.newComment = {...subComment}
  }
  if (state.newComment.message == '') return
  state.newComment.id ? await edit() : await add()
}

const deleteComment = async (id) => {
  await commentsApi.deleteComment(id)
    .then(res => {
      getComments()
      notification.success('حذف انجام شد')
      state.selectedComment = null
    }).catch(e => notification.apiError(e?.data?.messages))
    state.dialog = false
}

const handleComment = (comment) => {
  state.selectedComment = { ...comment }
  getComment()
  state.IsAdd = false
  state.IsEdit = false
  state.newComment.parentId = state.selectedComment.id
}

const handleAddComment = () => {
  state.IsAdd = true
  state.IsEdit = false
  state.newComment = {
    message: null,
    parentId: state.selectedComment.id,
  }
}

const handleEditComment = (selectedComment) => {
  state.IsAdd = false
  state.IsEdit = true
  state.newComment = { ...selectedComment }
}

</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2>نظرات</h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <v-dialog v-model="state.advanceDialog" transition="dialog-bottom-transition" class="w-50">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn append-icon="mdi-cog" size="small" text="فیلتر پیشرفته" class="ma-0 rounded-0 h-100 px-4"
          v-bind="activatorProps"></v-btn>
      </template>

      <v-card>
        <v-toolbar>
          <v-btn icon="mdi-close" @click="state.advanceDialog = !state.advanceDialog"></v-btn>
          <v-toolbar-title>فیلتر پیشرفته</v-toolbar-title>
        </v-toolbar>

        <v-list lines="two" subheader class="my-10">
          <v-list-item>
            <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
              label="تعداد نمایش" hide-details @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.appId" @update:model-value="changePageing" variant="outlined"
              :items="[{ title: 'همه', id: null }, { title: 'فروشگاه', id: 5 },{title: 'دایه یار', id: 8}]"
              item-value="id" item-title="title" density="compact" label="برنامه" hide-details
              class="mt-1"></v-select>
          </v-list-item>
          <v-list-item>
            <v-select v-model="state.targetType"
              :items="state.appId && state.appId == 5 ? storeTargetTypes : state.appId && state.appId == 8 ? dayeTargetTypes : []" variant="outlined"
              density="compact" label="نوع" item-title="title" item-value="id" hide-details
              @update:modelValue="changePageing" class="mt-1"></v-select>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </v-toolbar>
  <v-row>
    <v-col cols="6" md="4">
      <v-card flat>
        <v-card-item>
          <v-form @submit.prevent="changePageing" style="display: contents;">
            <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact"
              label="جستجو با شماره تماس" hide-details @click:append-inner="changePageing" class="mb-3 mt-1"
              append-inner-icon="mdi-magnify"></v-text-field>
          </v-form>
          <!-- <v-select v-model="state.metadata.pageSize" :items="[10, 20, 50, 100]" variant="outlined" density="compact"
            label="تعداد نمایش" hide-details @update:modelValue="changePageing"></v-select> -->
        </v-card-item>
        <v-list>
          <v-list-item v-for="comment in state.comments" :key="comment.id" @click="handleComment(comment)">
            <template v-slot:default>
              <p v-if="comment.firstname && comment.lastName"><strong>{{ `${comment.firstname} ${comment.lastName}`
                  }}</strong></p>
              <span v-if="comment.phoneNumber">{{ comment.phoneNumber }}</span>
              <p v-if="!comment.firstname && !comment.phoneNumber"><strong>{{ comment.anonymousUserName }}</strong></p>
            </template>
            <template v-slot:append>
              <v-icon icon="mdi-chevron-left"></v-icon>
            </template>
          </v-list-item>
        </v-list>
        <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex"
          @update:modelValue="changePageing"></v-pagination>
      </v-card>
    </v-col>

    <v-col v-if="state.selectedComment" cols="6" md="8">
      <v-card flat max-width="500px" class="ms-auto">
        <v-card-title class="d-flex justify-space-between">
          <p>
            <span v-if="state.selectedComment.firstname"><strong>{{ `${state.selectedComment.firstname} ${state.selectedComment.lastName}` }}</strong></span>
            <span v-if="!state.selectedComment.firstname">{{ state.selectedComment.phoneNumber }}</span>
            <span v-if="!state.selectedComment.firstname && !state.selectedComment.phoneNumber"><strong>{{state.selectedComment.anonymousUserName }}</strong></span>
              <p v-if="state.targetName">
                <v-icon size="xs" class="mx-2">mdi-eye</v-icon>
                <a v-if="state.selectedComment.appId == 5" :href="`${STORE_LINK}${state.selectedComment.targetId}/${state.targetName.spaceRemover()}`" target="_blank">{{storeTargetTypes.find(x=>x.id == state.selectedComment.targetType)?.title}} >> {{ state.targetName }}</a>
                <a v-if="state.selectedComment.appId == 8" :href="`${DAYEYAR_LINK}${state.selectedComment.targetId}/${state.targetName.spaceRemover()}`" target="_blank">{{dayeTargetTypes.find(x=>x.id == state.selectedComment.targetType)?.title}} >> {{ state.targetName }}</a>
              </p>
          </p>
          <p><small><small>{{ `${dateConverter.convertToJalali(state.selectedComment.createdOnUtc)}` }}</small></small>
          </p>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <span>{{ state.selectedComment.message }}</span>
          <span class="d-flex align-center justify-space-between mt-3">
            <p :class="state.selectedComment.publishStatus ? 'text-green' : 'text-orange'"
              v-text="state.selectedComment.publishStatus ? 'منتشر شده' : 'بایگانی'"></p>
            <p class="d-flex ga-1">
              <span>{{ state.selectedComment.likeCount }}</span>
              <v-icon class="text-red">mdi-heart</v-icon>
            </p>
          </span>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-action flat class="px-2" :class="state.IsEdit ? '' : 'd-flex align-center'">
          <v-btn v-if="!state.IsEdit" variant="text" class="text-orange rounded" icon="mdi-pen"
            @click="handleEditComment(state.selectedComment)"></v-btn>
          <v-btn v-if="!state.IsAdd" variant="text" class="text-blue rounded" icon="mdi-keyboard"
            @click="handleAddComment"></v-btn>
          <v-btn variant="text" class="text-red rounded" icon="mdi-delete"
            @click="()=>{state.dialog = !state.dialog;state.newComment = state.selectedComment }"></v-btn>
          <v-text-field v-if="state.IsAdd" variant="outlined" label="جواب دادن به کاربر" prepend-inner-icon="mdi-send"
            density="compact" color="blue" hide-details @click:prepend-inner="save"
            v-model="state.newComment.message"></v-text-field>
          <v-textarea v-if="state.IsEdit" variant="outlined" label="ویرایش پیام کاربر"
            v-model="state.newComment.message" density="compact" color="orange" hide-details auto-grow
            class="px-2"></v-textarea>
          <div class="d-flex align-center px-2" v-if="state.IsEdit">
            <v-checkbox class="w-50" label="وضعیت انتشار" v-model="state.newComment.publishStatus"
              hide-details></v-checkbox>
            <v-btn class="bg-orange w-50 text-white" @click="save">ذخیره</v-btn>
          </div>
        </v-card-action>
      </v-card>





      <v-card flat class="mt-3" v-for="answer in state.selectedComment?.subComment" max-width="500px">
        <v-card-title class="d-flex justify-space-between align-center ga-4">
          <p class="d-flex ga-4">
            <span>شما</span>
            <span><small><small>{{ `${dateConverter.convertToJalali(answer.createdOnUtc)}` }}</small></small></span>
          </p>
          <v-btn class="text-red rounded" variant="text" icon="mdi-delete"
            @click="()=>{state.dialog = !state.dialog;state.newComment = answer}"></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-textarea variant="outlined" label="ویرایش پیام شما" v-model="answer.message" density="compact"
            color="orange" hide-details auto-grow></v-textarea>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-4">
          <v-btn class="bg-orange text-white rounded" block @click="save(answer)" icon="mdi-floppy"></v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>


  <Sdialog v-model="state.dialog" title="حذف نظر کاربر" size="xs">
    <v-card flat>
      <v-card-text>
        <p class="mt-5 mb-1 text-center"><strong>آیا مطمئن هستید؟</strong></p>
        <p class="mb-5 mt-1 text-center">عملیات حذف غیر قابل بازگشت است!</p>
      </v-card-text>
      <v-card-actions>
        <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
        <v-btn class="bg-red w-50" @click="deleteComment(state.newComment.id)">تایید</v-btn>
      </v-card-actions>
    </v-card>
  </Sdialog>
</template>
<style scoped>
a {
  text-decoration: none;
  font-size: 14px;
  color: #000;
  text-wrap: wrap;
}
</style>