<script setup>
import forumApi from '@/services/api/yarServices/forumApi';
import topicApi from '@/services/api/yarServices/topicApi';
import topiccommentApi from '@/services/api/yarServices/topiccommentApi';
import Sdialog from "@/components/SDialog.vue"
import dateConverter from "@/composables/dateConverter"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const verifyForm = ref({});
const route = useRoute()
const router = useRouter()
const state = reactive({
  comments: [],
  metadata: {
    pageSize: 50,
    pageIndex: 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  comment: {
    id: 0,
    comment: null,
    topicId: route.params.topicId,
    parentId: null,
    isActive:true,
  },
  selectedComment: null,
  forum: null,
  topic: null,
  searchFilters: [],
  dialog: false,
  isDelete: false,
  isEdit: false,
  isReply:false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تالارهای گفتگو',
      to: '/dashboard/forum/list',
    }, ...b])
}

const getComments = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    searchFilters: [{ field: "title", operator: 6, value: route.query.search }],
    topicId: route.params.topicId,
  }
  const { data, metadata } = await topiccommentApi.list(payload)
    .then((res) => res)
    .catch((e) => notification.apiError(e?.data?.messages))
  state.comments = data
  state.metadata = metadata
}

const getTopic = async () => {
  await topicApi.getById(route.params.topicId)
    .then(res => state.topic = res.data)
    .catch((e) => notification.apiError(e?.data?.messages))
  getForum()
}

const getForum = async () => {
  await forumApi.getById(route.params.forumId)
    .then(res => {
      state.forum = res.data
      setBreadCrumb([
        {
          title: `موضوعات تالار گفتگوی ${state.forum.title}`,
          to: `/dashboard/forum/${state.forum.id}/topic/list`,
        },
        {
          title: `نظرات موضوع ${state.topic.title}`,
        },
      ])
    })
    .catch((e) => notification.apiError(e?.data?.messages))
}

const add = async () => {
  await topiccommentApi.add(state.comment)
    .then(res => {
      notification.success('افزودن جدید انجام شد')
      state.dialog = !state.dialog
      getComments()
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const edit = async () => {
  await topiccommentApi.edit(state.comment)
    .then(res => {
      notification.success('ویرایش انجام شد')
      state.dialog = !state.dialog
      getComments()
    })
    .catch(e => notification.apiError(e?.data?.messages))
}

const save = async () => {
  const { valid } = await verifyForm.value.validate()
  if (valid) {
    if (state.comment.id > 0)
      await edit();
    else
      await add()
  }
}

const deleteComment = async (id) => {
  await topiccommentApi.delete(id)
    .then(notification.success('عملیات موفق'))
    .catch(e => notification.apiError(e?.data?.messages))
  state.dialog = false
  getComments()
}

const loadMore = () => {
  state.metadata.pageIndex++
  getComments()
}

// const changePageing = () => {
//   if (state.searchFilters.value && state.searchFilters.value != '') {
//     router.replace({ path: `/dashboard/forum/${route.params.forumId}/topic/${route.params.topicId}/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, search: state.searchFilters.value } })
//   } else {
//     router.replace({ path: `/dashboard/forum/${route.params.forumId}/topic/${route.params.topicId}/list`, query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
//   }

//   setTimeout(() => {
//     getComments()
//   }, 50);
// }

const handleAdd = () => {
  state.comment = {
    comment: null,
    topicId: route.params.topicId,
    parentId: null,
  },
  state.isDelete = false
  state.isEdit = false
  state.isReply = false
  state.dialog = true
}

const handleReply = (comment) => {
  state.comment = {
    comment: null,
    topicId: route.params.topicId,
    parentId: comment.id,
    reply: comment.comment,
    username: `${comment.userFirstName} ${comment.userLastName}`,
  },
  state.isDelete = false
  state.isEdit = false
  state.isReply = true
  state.dialog = true
}

const handleEdit = (comment) => {
  state.comment = { ...comment,isActive:true }
  state.isReply = false
  state.isDelete = false
  state.isEdit = true
  state.dialog = true
}

const handleDelete = (comment) => {
  state.comment = {
    id: comment.id,
    title: comment.comment,
    username: `${comment.userFirstName} ${comment.userLastName}`
  }
  state.isReply = false
  state.isDelete = true
  state.isEdit = false
  state.dialog = true
}

const validator = {
  comment: [(value) => value ? true : "وارد کردن متن اجباری است."],
}

getTopic()
getComments()
</script>

<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title>
      <h2 class="text-wrap"><small><small>{{ `نظرات موضوع ${state.topic?.title} از تالار گفتگو ${state.forum?.title}`}}</small></small></h2>
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <!-- <v-form @submit.prevent="changePageing" style="display: contents;">
      <v-text-field v-model="state.searchFilters.value" type="search" variant="outlined" density="compact" label="جستجو" hide-details @click:append-inner="changePageing" class="px-5" append-inner-icon="mdi-magnify"></v-text-field>
    </v-form> -->
    <v-btn class="bg-blue ma-0 rounded-0 h-100" @click="handleAdd"><v-icon class="pa-1">mdi-plus</v-icon></v-btn>
  </v-toolbar>

  <v-row no-gutters v-for="comment in state.comments" class="flex-column-reverse">
    <v-col cols="7" :class="comment.userId == 1 ? 'ms-auto' : ''">
      <div class="d-flex">
        <v-avatar class="mt-3 mx-3" color="blue-grey-lighten-1">
          <span class="text-h5">{{ `${comment.userFirstName?.split('')[0]}${comment.userLastName?.split('')[0]}` }}</span>
        </v-avatar>
        <v-card flat class="border rounded mb-3 w-100">
          <v-card-text class="w-100">
            <div class="d-flex flex-nowrap">
              <v-card flat class="w-100">
                <v-card-text class="pa-0 px-4">
                  <small>{{ `${comment?.userFirstName} ${comment?.userLastName}` }}</small>
                  .
                  <small>{{ `${dateConverter.convertToJalali(comment?.createdOnUtc)}` }}</small>
                </v-card-text>
                <v-card-text>{{ comment.comment }}</v-card-text>
                <v-card-subtitle class="text-gray d-flex justify-space-between align-center border-t">
                  <p>{{ comment.isActive ? 'مشاهده آزاد است.' : 'مسدود است.' }}</p>
                  <div class="text-gray d-flex justify-end">
                    <v-btn variant="text" icon style="border-radius: 5px;" class="text-red" @click="handleDelete(comment)"><v-icon>mdi-delete</v-icon></v-btn>
                    <v-btn variant="text" icon style="border-radius: 5px;" class="text-orange" @click="handleEdit(comment)"><v-icon>mdi-pen</v-icon></v-btn>
                    <v-btn variant="text" icon style="border-radius: 5px;" class="text-blue" @click="handleReply(comment)"><v-icon>mdi-reply</v-icon></v-btn>
                  </div>
                </v-card-subtitle>
              </v-card>
            </div>
          </v-card-text>
          <v-card-text class="bg-grey" v-if="state.isTextBox">
            <v-text-field label="label" variant="outlined" hide-details prepend-icon="mdi-send" append-icon="mdi-close"></v-text-field>
          </v-card-text>
        </v-card>
      </div>
    </v-col>
  </v-row>

  <div class="text-center" v-if="state.metadata.hasNextPage">
    <v-btn class="bg-blue" @click="loadMore" icon style="border-radius: 5px;"><v-icon>mdi-reload</v-icon></v-btn>
  </div>




  <Sdialog v-model="state.dialog" :title="state.isDelete ? 'حذف نظر' : state.isEdit ? 'ویرایش نظر' : state.isReply ? 'جواب دادن به' : 'افزودن نظر'" size="xs">

    <template v-if="state.isDelete">
      <v-card flat>
        <v-card-text>
          <p class="mb-3"> نظر کاربر <strong>{{ state.comment.username }}</strong> حذف می شود. <br />'{{ state.comment.title }}'<br />
            آیا مطمئن هستید؟ عملیات حذف غیر قابل بازگشت است!
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn class="border w-50" @click="state.dialog = !state.dialog">انصراف</v-btn>
          <v-btn class="bg-red w-50" @click="deleteComment(state.comment.id)">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </template>

    <template v-else>
      <v-form @submit.prevent="save" ref="verifyForm">
        <v-card flat>
          <v-card-text v-if="state.isReply" class="pb-0">
            <p class="pb-3">نظر کاربر <strong>{{ state.comment.username }}</strong>:</p>
            <p class="bg-grey rounded pa-3">"{{ state.comment.reply }}"</p>
          </v-card-text>
          <v-card-text>
            <v-checkbox v-if="state.isEdit" label="مشاهده آزاد باشد" v-model="state.comment.isActive"></v-checkbox>
            <v-textarea v-model="state.comment.comment" variant="outlined" density="compact" label="متن نظر*" class="mb-2" :rules="validator.comment" auto-grow rows="3"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="outlined" class="w-50 bg-red" @click="state.dialog = !state.dialog">لغو</v-btn>
            <v-btn variant="outlined" class="w-50 bg-blue" type="submit">ذخیره</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </template>
  </Sdialog>
</template>