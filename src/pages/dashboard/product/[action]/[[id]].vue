<script setup>
import categoriesApi from '@/services/api/store/categoriesApi';
import productApi from '@/services/api/store/productApi.js';
import Suploader from "@/components/SUploader.vue"
import Simage from "@/components/SImage.vue"
import notification from "@/utils/notification.js"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
    product: {
        id: 0,
        title: null,
        specification: null,
        categoryId: null,
        category: null,
        description: null,
        imageList: []
    },
    categories: [],
    image: null,
    selectedImage: null,
    productTitle:null,
    imageError: false,
})

const setBreadCrumb = (b = []) => {
    dashboardbreadcrumbstore().setBreadCrumbs([
        {
            title: 'محصولات ',
            to: '/dashboard/product/list',
        },
        ...b])
}

const getProduct = async () => {
    state.product = await productApi.getById(route.params.id)
        .then((res) => res.data)
        .catch((error) => notification.apiError(error?.data?.messages))
    state.productTitle = state.product.title
    state.product.categoryId = state.product.category.id
    state.selectedImage = state.product?.imageList.find(image => image.default)
    setBreadCrumb([{
        title: route.params.action == 'edit' ? `ویرایش ${state.product.title}` : 'افزودن محصول',
        to: '/dashboard/product/list',
    }])
}

const getCategories = async () => {
    const { data } = await categoriesApi.getAll()
        .then(res => res)
        .catch(erorr => notification.apiError(erorr?.data?.messages))
    state.categories = data
    for (const item of state.categories) {
        if (item.parentCategoryId){
            item.newTitle = null
            if(state.categories.find(x=>x.id == item.parentCategoryId).parentCategoryId)
             item.newTitle = `${state.categories.find(y=>y.id == state.categories.find(x=>x.id == item.parentCategoryId).parentCategoryId).title} > ${state.categories.find(x=>x.id == item.parentCategoryId).title} > ${item.title}`
            else item.newTitle = `${state.categories.find(x=>x.id == item.parentCategoryId).title} > ${item.title}`
        } 
    }

    state.categories = state.categories.filter(x=>!x.hasChild)
}

const add = async () => {
    await productApi.add(state.product)
        .then(res => {
            notification.success('افزودن محصول جدید انجام شد')
            router.push(`/dashboard/product/edit/${res.data}`)
        })
        .catch(error => notification.apiError(error?.data?.messages))
}

const edit = async () => {
    await productApi.edit(state.product)
        .then(res => notification.success('ویرایش انجام شد'))
        .catch(error => notification.apiError(error?.data?.messages))
}

const save = async (values) => {
    const { valid } = await verifyForm.value.validate()
    if (!valid) {
        if (!state.product.imageList.some(image => image.default)) state.imageError = true
        return
    }
    if (!state.product.imageList.some(image => image.default)) {
        state.imageError = true
        return
    }
    if (state.product.id > 0)
        await edit();
    else
        await add()
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    categoryId: [(value) => value ? true : "وارد کردن دسته بندی اجباری است."],
    description: [(value) => value ? true : "وارد کردن توضیحات مختصر اجباری است."],
};

const uploadImage = (value) => {
    if (state.product.imageList.length < 6) state.product.imageList.push({ imageId: value, default: false })
}

const deleteUploadedImage = () => {
    state.product.imageList = state.product.imageList.filter(image => image.imageId != state.selectedImage.imageId);
    state.selectedImage = null
}

const setToPrimaryImage = () => {
    state.product.imageList.forEach(image => {
        image.default = false
    });
    state.product.imageList.find(image => image.imageId == state.selectedImage.imageId).default = true
    state.imageError = false
}


setBreadCrumb()
state.product = {
    id: 0,
    title: null,
    specification: null,
    categoryId: null,
    category: null,
    description: null,
    imageList: []
}
if (route.params.id) {
    getProduct()
} else {
    setBreadCrumb([{
        title: 'افزودن محصول',
    }])
}
getCategories()
</script>

<template>
    <v-toolbar class="mb-5 overflow-hidden" rounded color="white" elevation="1">
        <v-toolbar-title>
            <h2>{{ route.params.action == 'edit' ? `ویرایش ${state.productTitle}` : 'افزودن محصول' }}</h2>
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn v-if="!route.params.action" class="bg-blue ma-0 radius-right h-100" to="/dashboard/product/add/">
            <v-icon class="pa-1">mdi-plus</v-icon>
        </v-btn>
    </v-toolbar>

    <v-form @submit.prevent="save" ref="verifyForm">
        <v-card flat>
            <v-card-item>
                <v-card-text>
                    <v-row>


                        <v-col cols="4">
                            <Suploader @update:model-value="uploadImage" :hasImage="false"
                                :multiple="true" />
                            <Simage :src="state.selectedImage?.imageId" />
                            <p v-if="state.imageError" class="px-5 py-1" style="color: red;">بارگزاری عکس شاخص الزامی
                                است.</p>
                            <v-btn v-if="state.selectedImage" class="bg-green w-50" prepend-icon="mdi-check"
                                @click="setToPrimaryImage" :disabled="!state.selectedImage?.default ? false : true">عکس
                                شاخص</v-btn>
                            <v-btn v-if="state.selectedImage" class="bg-red w-50" prepend-icon="mdi-delete-forever"
                                @click="deleteUploadedImage">حذف</v-btn>
                            <div class="d-flex justify-center ga-1 mb-1 mt-1">
                                <Simage v-for="image in state.product.imageList" class="border"
                                    style="max-width: 50px;cursor: pointer;" :src="image.imageId"
                                    @click="state.selectedImage = image" />
                            </div>
                        </v-col>



                        <v-col cols="8">
                            <v-text-field label="عنوان محصول*" density="compact" variant="outlined" class="mb-1"
                                v-model="state.product.title" :rules="validator.title"></v-text-field>

                            <v-autocomplete label="دسته بندی محصول*" :items="state.categories" item-title="newTitle"
                                item-value="id" class="mb-1" density="compact" variant="outlined"
                                v-model="state.product.categoryId" :rules="validator.categoryId" chips></v-autocomplete>

                            <v-textarea label="توضیحات*" density="compact" variant="outlined"
                                v-model="state.product.description" rows="10"
                                :rules="validator.description"></v-textarea>
                            <v-row>
                                <v-col cols="9"></v-col>
                                <v-col cols="3">
                                    <v-btn class="bg-blue" type="submit" block>ذخیره</v-btn>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card-item>
        </v-card>
    </v-form>
</template>
<style>
.profile-image {
    border: solid 1px #b3b3b3;
    padding: 3px;
}

.cursor-pointer {
    cursor: pointer;
}

.customDatePicker {
    display: flex;
    justify-content: space-between;
    border: 1px solid rgb(133, 133, 133);
    padding: 15px;
    border-radius: 3px;

}

.customDatePicker input {
    width: 100%;
    height: 100%;
    outline: none;
    border: none;
}
</style>
