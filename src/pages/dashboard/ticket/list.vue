<script setup>
import ticketsApi from '@/services/api/baseServices/ticketsApi';
import Sdialog from "@/components/SDialog.vue"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"
const route = useRoute()
const router = useRouter()
const ticketState = [
  {
    id: 1,
    title: "در انتظار بررسی",
    color: 'red'
  },
  {
    id: 2,
    title: "در حال بررسی",
    color: 'green'
  },
  {
    id: 3,
    title: "در انتظار تایید",
    color: 'blue'
  },
  {
    id: 4,
    title: "رد شده",
    color: 'grey'
  },
  {
    id: 5,
    title: "تایید شده",
    color: 'grey'
  },
  {
    id: 6,
    title: "بسته شده",
    color: 'grey'
  },
  {
    id: 7,
    title: "پاسخ داده شده",
    color: 'grey'
  },]
const state = reactive({
  tickets: [],
  metadata: {
    pageSize: route.query?.size ?? 10,
    pageIndex: route.query?.index ?? 1,
    totalPages: 0,
    totalCount: 0,
    hasPreviousPage: true,
    hasNextPage: true,
    parameters: null,
  },
  ticketState: ticketState.find(x=>x.id == route.query?.state)?.id ?? 1,
  newTicket: {
    title: null,
    description: null,
    parentId: 0,
    state: 6
  },
  editTicket: null,
  selectedTicket: null,
  searchFilters: [],
  dialog: false,
  IsAdd: false,
  IsEdit: false,
})

const setBreadCrumb = (b = []) => {
  dashboardbreadcrumbstore().setBreadCrumbs([
    {
      title: 'تیکت',
      to: '/dashboard/ticket/list',
    }, ...b])
}

const getTickets = async () => {
  let payload = {
    pageIndex: state.metadata.pageIndex,
    pageSize: state.metadata.pageSize,
    state: parseInt(state.ticketState),
    // searchFilters: [{ field: "stateTitle", operator: 6, value: route.query.search }],
  }
  const { data, metadata } = await ticketsApi.getAll(payload)
    .then((res) => res)
    .catch((error) => notification.apiError(error?.data?.messages))
  state.tickets = data
  state.metadata = metadata
}

const changePageing = () => {
  if (state.ticketState) {
    router.replace({ path: '/dashboard/ticket/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex, state: state.ticketState } })
  } else {
    router.replace({ path: '/dashboard/ticket/list', query: { size: state.metadata.pageSize, index: state.metadata.pageIndex } })
  }

  setTimeout(() => {
    getTickets()
  }, 50);
}

const add = async () => {
  if(!state.newTicket.description || state.newTicket.description == ''){
    notification.apiError('جواب نمیتواند خالی باشد!')
    return
  }
  await ticketsApi.add(state.newTicket)
    .then(res => {
      notification.success('پاسخ دادن به کاربر انجام شد')
      handleTicket({id:state.newTicket.parentId})
      state.newTicket.description = null
      getTickets()
    })
    .catch(error => notification.apiError(error?.data?.messages))
}

const deleteTicket = async (id) => {
  await ticketsApi.deleteComment(id)
    .then(res => {
      notification.success('حذف انجام شد')
      getTickets()
      state.selectedTicket = null
      state.newTicket = null
    }).catch(erorr => notification.apiError(erorr?.data?.messages))
  state.dialog = false
}

const handleTicket = async (ticket) => {
  await ticketsApi.getById(ticket.id)
  .then(res=>{
    state.selectedTicket = res.data
    state.newTicket.parentId = ticket.id
    state.newTicket.title = ticket.title
  })
  .catch(e=>notification.apiError(e?.data?.messages))
}

setBreadCrumb()
getTickets()

</script>
<template>
  <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
    <v-toolbar-title><h2>تیکت</h2></v-toolbar-title>
    <v-spacer></v-spacer>
  </v-toolbar>
  <v-row>
    <v-col cols="6" md="4">
      <v-card flat>
        <v-card-item>
          <v-autocomplete v-model="state.ticketState" @update:model-value="changePageing" :items="ticketState" item-title="title" item-value="id" variant="outlined" density="compact" label="وضعیت" hide-details class="mt-1"></v-autocomplete>
        </v-card-item>
        <v-list>
          <v-list-item v-for="(ticket, i) in state.tickets" :key="ticket.id" @click="handleTicket(ticket)" class="d-flex justify-space-between">
            <template v-slot:default>
              <div class="d-flex align-center ga-1">
                <v-icon :color="ticketState.find(state => state.id == ticket.state).color" size="xs">mdi-circle</v-icon>
                  <p>{{ `${ticket.firstName} ${ticket.lastName}` }}</p>
              </div>
            </template>
            <template v-slot:append>
              <v-icon :color="ticket.seen ? 'grey' : 'red'" icon="mdi-chevron-left"></v-icon>
            </template>
          </v-list-item>
        </v-list>
        <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="changePageing"></v-pagination>
      </v-card>
    </v-col>

    <v-col v-if="state.selectedTicket" cols="6" md="8">
      <v-card flat class="mb-3" transition="dialog-right-transition">
        <v-card-item class="pa-0">
          <v-card-text class="d-flex mb-5">
            <v-avatar icon="mdi-account" color="info" class="me-2"></v-avatar>
            <v-card flat class="border rounded w-100">
              <v-card-title class="px-4">
                <p>{{ state.selectedTicket.title }}</p>
              </v-card-title>
              <v-card-text class="text-right">
                <p>{{ state.selectedTicket.description }}</p>
                <p style="font-size: 10px;color:#848484">{{ (state.selectedTicket?.createdOnUtc) }}</p>
              </v-card-text>
            </v-card>
          </v-card-text>

          <template v-for="item in state.selectedTicket?.children">
            <v-card-text class="d-flex mb-5" dir="ltr" v-if="state.selectedTicket.userId != item.userId">
              <v-avatar icon="mdi-account" color="red" class="me-2"></v-avatar>
              <div>
                <v-card flat class="border rounded w-100">
                  <v-card-text class="text-right">
                    <p>{{ state.selectedTicket.description }}</p>
                    <p style="font-size: 10px;color:#848484">{{ (state.selectedTicket?.createdOnUtc) }}</p>
                  </v-card-text>
                </v-card>
                <v-btn class="text-red border-none" icon="mdi-delete" style="border-radius: 5px;" @click="deleteTicket(item.id)"></v-btn>
              </div>
            </v-card-text>

            <v-card-text class="d-flex mb-5" v-else>
              <v-avatar icon="mdi-account" color="info" class="me-2"></v-avatar>
              <v-card flat class="border rounded">
                <v-card-text>
                  <p>{{ item.description }}</p>
                  <p style="font-size: 10px;color:#848484">{{ (state.selectedTicket?.createdOnUtc) }}</p>
                </v-card-text>
              </v-card>
            </v-card-text>
          </template>
        </v-card-item>
      </v-card>
      <v-textarea prepend-inner-icon="mdi-send" placeholder="پاسخ دادن..." variant="solo" rows="1" auto-grow flat clearable v-model="state.newTicket.description" @click:prepend-inner="add"></v-textarea>
    </v-col>
  </v-row>
</template>
