<script setup>
import authApi from '@/services/api/identityServices/auth';
import { userStore } from '@/stores/userStore';
import { useDisplay } from 'vuetify'
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])
const { name } = useDisplay()
const user = userStore();
const router = useRouter();
const state = reactive({
  show:true,
  items: [
    { text: 'برنامه ها', icon: 'mdi-monitor-multiple', url:'/dashboard/apps/list' },
    { text: 'کاربران', icon: 'mdi-account-multiple', url:  '/dashboard/user/list' },
    { text: 'دسته ها', icon: 'mdi-view-grid-outline', url: '/dashboard/categories' },
    { text: 'نظرات', icon: 'mdi-comment-multiple-outline', url:  '/dashboard/comments/list' },
    { text: 'تیکت ها', icon: 'mdi-wechat', url:  '/dashboard/ticket/list' },
    { text: 'برچسب ها', icon: 'mdi-tag', url:  '/dashboard/tag/list' },
    {},
    { text: 'فروشگاه ها', icon: 'mdi-store', url:'/dashboard/store/list' },
    { text: 'محصولات', icon: 'mdi-tshirt-v', url:  '/dashboard/product/list' },
    { text: 'ویژگی ها', icon: 'mdi-gamepad-outline', url:  '/dashboard/attribute/list' },
    {},
    { text: 'متخصصان', icon: 'mdi-account-star', url:  '/dashboard/expert/list' },
    { text: 'تالارهای گفتگو', icon: 'mdi-twitter', url:  '/dashboard/forum/list' },
    { text: 'مقالات', icon: 'mdi-script-outline', url:  '/dashboard/article/list' },
    { text: 'پست ها', icon: 'mdi-post-outline', url:  '/dashboard/post/list' },
    {},
  ],
})

watch(()=>props.modelValue,()=> {
  state.show= name.value=='lg' || name.value=='xl' || name.value=='xxl' || props.modelValue
})

const logOut = async() =>{
  await authApi.post.logOut({})
  .then(res => {
    user.setLogOut()
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('userInfo')
    router.push('/auth')
  })
  .catch(e=>notification.apiError(e?.data?.messages))
}

</script>
<template>
  <v-navigation-drawer expand-on-hover v-model="state.show" :rail="!props.modelValue"
  :permanent="name=='lg' || name=='xl' || name=='xxl'"
  :temporary="name=='md' || name=='sm' || name=='xs'"
  color="grey-darken-3" style="position: fixed;" @update:modelValue="emits('update:modelValue')">
    <v-list variant="plain">
      <v-list-item to="/dashboard" class="text-center" title="کنترل پنل مدیریت دایه"></v-list-item>
    </v-list>
    <v-list density="compact">
      <v-list-item
        v-for="(item, i) in state.items"
        :key="i"
        :value="item"
        :to="item.url"
        >
        <template v-slot:prepend>
          <v-icon :icon="item.icon"></v-icon>
        </template>
        <v-list-item-title>{{ item.text }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="logOut">
        <template v-slot:prepend>
          <v-icon icon="mdi-logout"></v-icon>
        </template>
        <v-list-item-title>خروج</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

