<script setup>
import contentApi from '@/services/api/yarServices/contentApi';
import userApi from '@/services/api/identityServices/userApi';
import categoriesApi from '@/services/api/yarServices/categoriesApi';
import tagApi from '@/services/api/yarServices/tagApi';
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
import notification from "@/utils/notification.js"

const setBreadCrumb = (b = []) => {
    dashboardbreadcrumbstore().setBreadCrumbs([
        {
            title: 'پست ها',
            to: '/dashboard/post/list',
        }, ...b])
}

const verifyForm = ref({});
const route = useRoute()
const router = useRouter()

const state = reactive({
    categories: [],
    tags: [],
    newPost: {
        title: null,
        body: null,
        summary: null,
        keywordList: [],
        contentType:2,
        status: 1,
        commentStatus: true,
        commentShow: true,
        categoryId: null,
        imageIds: []
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
    loading:false,
    imageError:false,
    bodyError:false,
    selectedImage:null,
    userName:null
})

onMounted(() => {
    tinyMCEInit()
})

const tinyMCEInit = () => {
    tinymce.editors = [];

    tinymce.init({
        mode: "exact",
        elements: "mytextarea",
        height: 200,
        themes: "advanced",
        skin: "lightgray",
        plugins: [
            'advlist autolink lists link image charmap print preview hr anchor pagebreak',
            'searchreplace visualblocks  code',
            // visualchars
            // wordcount
            'insertdatetime  nonbreaking save table contextmenu directionality',
            // media
            'emoticons template paste textcolor colorpicker textpattern imagetools'
        ],
        menubar: 'file tools edit insert format view table',
        toolbar1: ' fontsizeselect fontselect | bold italic | alignleft aligncenter alignright alignjustify  | link image',
        toolbar2: ' bullist numlist outdent indent | forecolor backcolor emoticons | ltr rtl | themes datebutton | ',
        directionality: "rtl",
        language: 'fa_IR',
        init_instance_callback: getPost,
        // filemanager_title: "Responsive File Manager",
        // file_browser_callback: function (field_name) {
        //     window.open('/Admin/FileManager/Index?out=' + field_name + '&act=ImageBrowser&typ=single', 'ImageBrowser', 'width=900,height=600,scrollbars=no,status=yes,location=no,resizable=yes,dependent');
        // }
    });

}

const editPost = async () =>{
    await contentApi.edit(state.newPost)
    .then(notification.success('پست با موفقیت ویرایش شد'))
    .catch(e => notification.apiError(e?.data?.messages))
}

const addPost = async () =>{
    await contentApi.add(state.newPost)
    .then(r => {
        notification.success('پست با موفقیت ذخیره شد')
        router.push('/dashboard/post/edit/' + r.data)
    }).catch(e => notification.apiError(e?.data?.messages))
}

const save = async () => {
    state.imageError=false
    state.bodyError=false
    const { valid } = await verifyForm.value.validate()

    state.newPost.body = tinyMCE.get("mytextarea").getContent()
    if(state.newPost.imageIds.length == 0) state.imageError = true
    if(state.newPost.body == '' || state.newPost.body == null) state.bodyError = true

    if (valid && !state.imageError && !state.bodyError) {
        state.newPost.id ? editPost() : addPost()
    }
}

const getUsers = async () =>{
    const payload = {
        pageSize: state.metadata.pageSize,
        pageIndex: state.metadata.pageIndex,
        search:state.search ?? '',
    }
    const { data, metadata } = await userApi.getAll(payload)
        .then((res) => res)
        .catch((e) => notification.apiError(e?.data?.messages))
        state.users = data
        state.metadata = metadata
}

const getPost = async () => {
    if (route.params.id) {
        const { data } = await contentApi.getById(route.params.id)
            .then((res) => res)
            .catch((e) => notification.apiError(e?.data?.messages))
        state.newPost = data
        state.selectedImage = state.newPost.imageIds.find(x=>x)
        tinymce.get('mytextarea').setContent(state.newPost.body);
        setBreadCrumb([{
            title: `ویرایش پست ${state.newPost.title}`,
        }])
        getCategories()
        getTags()
    }
}

const getCategories = async () =>{
    const { data } = await categoriesApi.getAll()
        .then((res) => res)
        .catch((e) => notification.apiError(e?.data?.messages))
    state.categories = data.filter(x=>!x.hasChild)
}

const getTags = async () =>{
    const { data } = await tagApi.byCatId(state.newPost.categoryId)
        .then((res) => res)
        .catch((e) => notification.apiError(e?.data?.messages))
    state.tags = data
}

const uploadImage = (value) => {
    if (state.newPost.imageIds.length < 1) state.newPost.imageIds.push({ imageId: value, default: false })
    state.newPost.imageIds.find(x=>x).default = true
    state.selectedImage = state.newPost.imageIds.find(x=>x)
}

const deleteUploadedImage = () => {
    state.newPost.imageIds = state.newPost.imageIds.filter(image => image.imageId != state.selectedImage.imageId);
    state.selectedImage = state.newPost.imageIds.find(x=>x)
}

const setToPrimaryImage = () => {
    state.newPost.imageIds.forEach(image => {
        image.default = false
    });
    state.newPost.imageIds.find(image => image.imageId == state.selectedImage.imageId).default = true
    state.imageError = false
}

const handleNewUserDialog = () => {
    state.dialog = !state.dialog
    if(!state.users){
        state.loading = true
        getUsers()
        state.loading = false
    }
}

const handleNewUser = (user) =>{
    state.newPost.userId = user.id
    state.dialog = false
    state.userName = user.firstName + ' ' + user.lastName
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    categoryId: [(value) => value ? true : "وارد کردن دسته بندی اجباری است."],
};

setBreadCrumb()
if (!route.params.id) {
    setBreadCrumb([{
        title: 'پست جدید ',
    }])
}
getCategories()
</script>
<template>
    <v-toolbar class="mb-3 overflow-hidden" rounded color="white" elevation="1">
        <v-toolbar-title>
            <h2>{{ route.params.id ? 'ویرایش' : 'افزودن پست جدید' }}</h2>
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
                    <v-text-field v-model="state.userName" label="نام کاربر*" density="compact" variant="outlined" readonly hide-details></v-text-field>
                    <v-btn @click="handleNewUserDialog" class="text-blue border-none mt-1" icon="mdi-magnify" style="border-radius: 5px;" density="comfortable"></v-btn>
                </div>
                <p v-if="!state.newPost.userId" class="text-red">
                    <v-icon class="mx-1">mdi-alert</v-icon>
                    <span>کاربری هنوز انتخاب نشده است!</span>
                </p>
            </v-card-text>
        </v-card>

        <v-card class="mb-3" flat v-if="route.params.id && state.newPost.authorName">
            <v-card-title>
                نویسنده پست
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
                <p>{{ `${state.newPost.authorName} ${state.newPost.authorFamily}` }}</p>
            </v-card-text>
        </v-card>

        <v-row>
            <v-col cols="12" md="4">
                <v-card class="mb-5" flat>
                    <v-card-title>تصاویر پست*</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <s-uploader @update:model-value="uploadImage" :hasImage="false" style="max-width: 300px;" class="mx-auto" :multiple="false" />
                        <s-image v-if="state.newPost?.imageIds?.length > 0" :src="state.selectedImage?.imageId" />
                        <v-btn v-if="state.selectedImage" class="bg-green w-50" prepend-icon="mdi-check" @click="setToPrimaryImage" :disabled="!state.selectedImage?.default ? false : true">عکس شاخص</v-btn>
                        <v-btn v-if="state.selectedImage" class="bg-red w-50" prepend-icon="mdi-delete-forever" @click="deleteUploadedImage">حذف</v-btn>
                        <div class="d-flex justify-center ga-1 mb-1 mt-1">
                            <s-image v-for="image in state.newPost.imageIds" class="border" style="max-width: 50px;cursor: pointer;" :src="image.imageId" @click="state.selectedImage = image" />
                        </div>
                        <p v-if="state.imageError && state.newPost.imageIds.length == 0" class="px-5 py-1 text-red">بارگزاری حداقل یک عکس الزامی است.</p>
                    </v-card-text>

                    <v-card-title>دسته بندی پست</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-autocomplete v-model="state.newPost.categoryId" :rules="validator.categoryId" variant="outlined" :items="state.categories" item-value="id" item-title="title" density="compact" label="دسته بندی*" @update:model-value="getTags" />
                    </v-card-text>

                    <!-- <v-card-title>برچسب های پست</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-autocomplete :disabled="state.newPost.categoryId ? false : true" v-model="state.newPost.keywordList" variant="outlined" :items="state.tags" item-value="title" density="compact" label="برچسب" multiple/>
                    </v-card-text> -->

                    <v-card-text class="pa-3">
                        <v-checkbox v-model="state.newPost.commentStatus" label="نمایش نظرات" density="compact" hide-details></v-checkbox>
                        <v-checkbox v-model="state.newPost.commentShow" label="نمایش خودکار نظرات" density="compact" hide-details></v-checkbox>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" md="8">
                <v-card flat>
                    <v-card-title>محتوای پست</v-card-title>
                    <v-divider></v-divider>
                    <v-card-text>
                        <v-text-field v-model="state.newPost.title" :rules="validator.title" variant="outlined" density="compact" label="عنوان پست*" class="mb-1"></v-text-field>
                        <!-- <v-textarea v-model="state.newPost.summary" :rules="validator.summary" variant="outlined" label="چکیده پست" placeholder="چند جمله از پست..." rows="8" density="compact" auto-grow counter="500" class="mb-1"></v-textarea> -->
                        <textarea id="mytextarea"></textarea>
                        <p v-if="!state.newPost.userId && state.bodyError" class="text-red">
                            <v-icon class="mx-1">mdi-alert</v-icon>
                            <span>وارد کردن محتوا اجباری است!</span>
                        </p>
                        <v-select variant="outlined" density="compact" :items="[{id:1,title:'آرشیو'},{id:2,title:'منتشر'},{id:3,title:'موقت'}]" item-value="id" item-title="title" v-model="state.newPost.status" label="وضعیت نمایش" class="mt-3" hide-details></v-select>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-text class="py-0">
                        <v-row class="mt-3" no-gutters>
                            <v-col cols="12" lg="3" sm="6">
                                <v-chip variant="text" class="ma-2">
                                    <v-Icon>mdi-heart</v-Icon>
                                    <span>{{ state.newPost.likeCount ?? 0 }}</span>
                                </v-chip>
                                <v-chip variant="text" class="ma-2">
                                    <v-Icon>mdi-eye</v-Icon>
                                    <span>{{ state.newPost.visitedCount ?? 0 }}</span>
                                </v-chip>
                            </v-col>
                            <v-col cols="12" lg="3" sm="6">
                                <v-btn block type="submit" class="bg-blue">ذخیره</v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-form>



    <s-dialog v-model="state.dialog" size="xl" title="انتخاب کاربر">
        <template v-if="state.loading"><p class="text-center"><strong>در حال بارگزاری اطلاعات</strong></p></template>
        <template v-else>
            <v-text-field v-model="state.search" type="search" variant="outlined" density="compact" label="جستجو" hide-details append-inner-icon="mdi-magnify" @keyup.enter="getUsers"></v-text-field>
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
                    <tr v-for="(user, i) in state.users" :key="user.id">
                        <td>{{ ((state.metadata.pageIndex - 1) * state.metadata.pageSize + i) +
                            1 }}</td>
                        <td>{{ user.firstName + ' ' + user.lastName }}</td>
                        <td>{{ user.phoneNumber }}</td>
                        <td class="text-end">
                            <v-btn class="bg-blue" @click="handleNewUser(user)">انتخاب</v-btn>
                        </td>
                    </tr>
                </tbody>
            </v-table>
            <v-pagination :length="state.metadata?.totalPages" v-model="state.metadata.pageIndex" @update:modelValue="getUsers"></v-pagination>
        </template>
    </s-dialog>
</template>