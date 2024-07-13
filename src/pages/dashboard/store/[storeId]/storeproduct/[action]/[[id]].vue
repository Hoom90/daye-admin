<script setup>
import productApi from '@/services/api/store/productApi';
import storeApi from '@/services/api/store/storeApi';
import tagApi from '@/services/api/store/tagsApi';
import storeProductApi from '@/services/api/store/storeProductApi';
import categoriesApi from '@/services/api/store/categoriesApi';
import attributesApi from '@/services/api/store/attributesApi';
import notification from "@/utils/notification.js"
import { dashboardbreadcrumbstore } from "@/stores/dashboard.js"
const route = useRoute()
const router = useRouter()
const verifyForm = ref({});
const state = reactive({
    storeProduct: {
        productId: null,
        count: 0,
        amount: 0,
        specification: null,
        description: null,
        categoryId: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        discountActivation: true,
        discountPercent: 0,
        discountStartDate: null,
        discountEndDate: null,
        isActive: true,
        specialSale: true,
        tagIds: [],
        imageList: [],
        attributeList: null,
    },
    newStoreProduct: {
        storeId: route.params.storeId,
        productId: null,
        count: 0,
        amount: 0,
        specification: null,
        description: null,
        categoryId: 0,
        weight: 0,
        length: 0,
        width: 0,
        height: 0,
        discountActivation: true,
        discountPercent: 0,
        discountStartDate: null,
        discountEndDate: null,
        isActive: true,
        specialSale: true,
        tagIds: [],
        imageList: [],
        attributeList: null,
    },
    noFilterCategories: null,
    categories: null,
    parentCategoryId: null,
    products: null,
    attributes: null,
    attributeSelectable: [],
    attribute: [],
    attributeSelected1: [],
    attributeSelected2: [],
    tags:null,
    imageList: [],
    imageId: null,
    isImageUploader: false,
    image: null,
    selectedImage: null,
    tab: 1,
})

const constract = {
    attributeType: {
        string: 0,  //ویژگی متنی
        multi: 1,//ویژگی نمایشی
        select: 2// ویژگی قابل انتخاب از سمت خریدار
    }
}

const setBreadCrumb = (b = []) => {
    dashboardbreadcrumbstore().setBreadCrumbs([...b])
}

const getStore = async () => {
    const { data } = await storeApi.getById(route.params.storeId)
        .then((res) => res)
        .catch((error) => notification.apiError(error?.data?.messages))
    state.store = data
    if (route.params.id) {
        getStoreProduct()
    }else{
        await getAllCategory()
        setBreadCrumb([
            {
                title: 'فروشگاه ها ',
                to: '/dashboard/store/list',
            },
            {
                title: state.store.title,
                to: `/dashboard/store/${state.store.id}/storeproduct/list`,
            },
            {
                title: 'افزودن کالا',
            },
        ])
    }
}

const getStoreProduct = async () => {
    const { data } = await storeProductApi.getById(route.params.id)
        .then((res) => res)
        .catch((error) => notification.apiError(error?.data?.messages))
    state.storeProduct = data
    state.newStoreProduct = { ...state.storeProduct }
    setBreadCrumb([
            {
                title: 'فروشگاه ها ',
                to: '/dashboard/store/list',
            },
            {
                title: state.store.title,
                to: `/dashboard/store/${state.store.id}/storeproduct/list`,
            },
            {
                title: `ویرایش ${state.storeProduct.productTitle} مدل ${state.storeProduct.specification}`,
            },
        ])
        state.tab=2
        await getProducts()
}

const getAllCategory = async () => {
    const { data } = await categoriesApi.getAll()
        .then(res => res)
        .catch(e => notification.apiError(e?.data?.messages))
    state.noFilterCategories = data
    state.categories = state.noFilterCategories.filter(x => x.parentCategoryId == state.parentCategoryId)
}

const getProducts = async () => {
    if (!state.newStoreProduct.categoryId) return
    const { data } = await productApi.listByCatId(state.newStoreProduct.categoryId)
        .then(res => res)
        .catch(e => notification.apiError(e?.data?.messages))
    state.products = data
}

const getAttributes = async () => {
    if (!state.newStoreProduct.categoryId) return
    const { data } = await attributesApi.listByCatId(state.newStoreProduct.categoryId)
        .then(res => res)
        .catch(e => notification.apiError(e?.data?.messages))
    state.attributes = data

    state.attributeSelectable = state.attributes.filter(x => x.attributeType == constract.attributeType.select)
    state.attribute = state.attributes.filter(x => x.attributeType != constract.attributeType.select)

    let selectedIds = state.newStoreProduct?.attributes?.map(x => x.attributeId)
    if (selectedIds && selectedIds.length > 0) {
        let attributeSelected = state.attributes?.filter(x => selectedIds.includes(x.id))
        attributeSelected.forEach(x => {
            if (x.attributeType == constract.attributeType.string) {
                let attr = state.newStoreProduct?.attributes?.find(p => p.attributeId == x.id)
                x.value = attr.value
                x.storeProductAttribute = attr?.id
            }
            else
                x.values.forEach(n => {
                    let values = state.newStoreProduct?.attributes?.find(p => p.attributeId == x.id).values
                    let attr = values.find(p => p.attributeValueId == n.id)
                    n.storeProductAttribute = attr?.id
                    n.selected = attr ? true : false
                })
        })
    }
}

const getTags = async () =>{
    if (!state.newStoreProduct.categoryId) return
    const { data } = await tagApi.getByCatId(state.newStoreProduct.categoryId)
    .then(res => res)
        .catch(e => notification.apiError(e?.data?.messages))
        state.tags = data
}

const add = async () => {
    await storeProductApi.add(state.newStoreProduct)
        .then(res => {
            notification.success('افزودن کالای جدید انجام شد')
            router.push(`/dashboard/store/${route.fullPath.split('/')[3]}/storeproduct/edit/${res.data}`)
        })
        .catch(error => notification.apiError(error?.data?.messages))
}

const edit = async () => {
    await storeProductApi.edit(state.newStoreProduct)
        .then(res => {
            notification.success('بروزرسانی انجام شد')
            getStoreProduct()
        })
        .catch(error => notification.apiError(error?.data?.messages))
}

const save = async () => {
    const { valid } = await verifyForm.value.validate()
    if (!state.newStoreProduct.imageList) state.imageError = true
    if (valid && !state.imageError) {
        if (state.newStoreProduct.id > 0)
            await edit();
        else
            await add()
    }
}

const validator = {
    title: [(value) => value ? true : "وارد کردن عنوان اجباری است."],
    slogan: [(value) => {
        if (!value) return "وارد کردن شعار اجباری است."
        if (value.length > 25) return "حداکثر کارکتر ورودی 25 است"
        return true
    }],
    address: [(value) => value ? true : "وارد کردن آدرس اجباری است."],
    description: [(value) => {
        if (!value) return "وارد کردن توضیحات مختصر اجباری است."
        if (value.length > 100) return "حداکثر کارکتر ورودی 100 است"
        return true
    }],
};

getStore()

const selectCategory = (item) => {
    if (!item.hasChild) {
        state.newStoreProduct.categoryId = item.id
        getProducts()
        state.tab = 2
    }
    else {
        state.parentCategoryId = item.id
        state.categories = state.noFilterCategories.filter(x => x.parentCategoryId == state.parentCategoryId)
    }
}

const deselectCategory = () => {
    state.parentCategoryId = null
    state.categories = state.noFilterCategories.filter(x => x.parentCategoryId == state.parentCategoryId)
}

const uploadImage = (value) => {
    if (state.newStoreProduct.imageList.length < 5) state.newStoreProduct.imageList.push({ imageId: value, default: false })
}

const deleteUploadedImage = () => {
    state.newStoreProduct.imageList = state.newStoreProduct.imageList.filter(image => image.imageId != state.selectedImage.imageId);
    state.selectedImage = null
}

const setToPrimaryImage = () => {
    state.newStoreProduct.imageList.forEach(image => {
        image.default = false
    });
    state.newStoreProduct.imageList.find(image => image.imageId == state.selectedImage.imageId).default = true
    state.imageError = false
}

const handleProductSection = () => {
    state.tab = 2;
    // if(!state.products){
    getProducts();
    // }
}

const handleAttributesSection = () => {
    state.tab = 4;
    // if(!state.attributes){
        getAttributes();
    // }
}

const handleTagsSection = () => {
    state.tab = 7
    getTags()
}

const setAttribute = () => {
    if (state.attributes.length > 0) {
        if ((state.attributeSelectable.length != 0 && state.attributeSelected1.length != 0)){ process(); return}
        if((state.attributeSelected2.length != 0 && state.attribute.length != 0)){ process(); return}

        function process(){
            state.newStoreProduct.attributeList = []
            state.attributeSelected1.concat(state.attributeSelected2).forEach(item => {
                if (item.attributeType == constract.attributeType.string) {
                    if (item.value == null || item.value == '') {
                        notification.error('مقدار ویژگی را وارد کنید')
                        return
                    }
                    state.newStoreProduct.attributeList.push({
                        storeProductAttributeId: item.storeProductAttribute,
                        value: item.value,
                        attributeValueId: null,
                        attributeId: item.id,
                        attributeType: item.attributeType
                    })
                }
                else {
                    if(item.selected.length == 0){
                        notification.error('مقدار ویژگی را وارد کنید')
                        return
                    }
                    item.selected.forEach(el => {
                        state.newStoreProduct.attributeList.push({
                            value: null,
                            storeProductAttributeId: el.storeProductAttribute,
                            attributeValueId: el.id,
                            attributeId: item.id,
                            attributeType: item.attributeType
                        })
                    })
                }
            });
        }
    } else {
        state.newStoreProduct.attributeList = []
    }
}

const clearAttributeSelected1 = () =>{
    state.attributeSelected1 = []
    setAttribute()
}
const clearAttributeSelected2 = () =>{

    state.attributeSelected2 = []
    setAttribute()
}
</script>

<template>
    <v-toolbar class="mb-3">
        <div class="d-flex h-75 w-100 pa-0 shadow rounded bg-white">
            <v-toolbar-title class="ma-0 pa-3 px-5 rounded bg-white radius-left d-flex align-center">{{
                route.params.action ? route.params.action == 'edit' ? `ویرایش ${state.storeProduct?.productTitle} عنوان ${state.storeProduct?.specification}` : 'افزودن کالا' :
                ''}}</v-toolbar-title>
        </div>
    </v-toolbar>

    <v-form @submit.prevent="save" ref="verifyForm">
        <v-row>


            <v-col cols="12" md="4">
                <v-card flat>
                    <v-card-item>
                        <v-card-text>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 1" :disabled="route.params.id ? true : false">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.categoryId" class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    <span v-if="!route.params.id">دسته بندی*</span>
                                    <span v-else>دسته بندی {{ state.newStoreProduct?.category?.title }}</span>
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="handleProductSection">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.productId" class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    نام کالا*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 3">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.specification"
                                        class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    عنوان*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="handleAttributesSection">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.attributeList" class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    ویژگی ها*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 5">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.count > 0" class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    تعداد*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 6">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.amount > 0" class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    قیمت*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="handleTagsSection">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.tagIds?.length > 0"
                                        class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    تگ ها
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 8">
                                <template v-slot:prepend>
                                    <v-icon v-if="!state.newStoreProduct.description"
                                        class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    توضیحات
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 9">
                                <template v-slot:prepend>
                                    <v-icon
                                        v-if="!state.newStoreProduct.imageList.length > 0 || !state.newStoreProduct.imageList.find(x => x.default)"
                                        class="text-red">mdi-close</v-icon>
                                    <v-icon v-else class="text-green">mdi-check</v-icon>
                                    گالری*
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 10">
                                <template v-slot:prepend>
                                    وضعیت نمایش
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="border-none d-flex justify-space-between" block @click="state.tab = 11">
                                <template v-slot:prepend>
                                    فروش ویژه
                                </template>
                                <template v-slot:append>
                                    <v-icon>
                                        mdi-chevron-left
                                    </v-icon>
                                </template>
                            </v-btn>
                            <v-divider></v-divider>
                            <v-btn class="bg-blue" type="submit" block>ذخیره</v-btn>
                            <v-divider></v-divider>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>



            <v-col cols="12" md="8">
                <v-card flat>
                    <v-card-item>
                        <v-card-text v-if="state.tab == 1">
                            <v-card flat block v-if="state.parentCategoryId">
                                <template v-slot:text>
                                    <div class="d-flex align-center">
                                        <v-icon class="pa-5" v-if="state.parentCategoryId"
                                            @click="deselectCategory">mdi-arrow-right</v-icon>
                                        <!-- <v-text-field label="جستجو" append-inner-icon="mdi-magnify" variant="outlined"
                                            hide-details density="compact" single-line clearable
                                            disabled></v-text-field> -->
                                    </div>
                                </template>
                            </v-card>
                            <v-container>
                                <v-btn v-for="item in state.categories ? state.categories : []" variant="tonal"
                                    elevation="0" class="mb-1 pa-6 d-flex justify-space-between w-100 mx-auto" hover
                                    @click="selectCategory(item)">
                                    <template v-slot:prepend>
                                        <v-icon class="ml-1">mdi-view-grid</v-icon>
                                        <p>{{ item.title }}</p>
                                    </template>
                                    <template v-slot:append>
                                        <v-icon>mdi-arrow-left</v-icon>
                                    </template>
                                </v-btn>
                            </v-container>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 2">
                            <div v-if="!state.products" class="d-flex align-center ga-1 mb-1">
                                <v-icon color="red">mdi-alert</v-icon>
                                <p class="text-red">برای انتخاب <span class="underlineText">نام کالا</span> باید ابتدا
                                    دسته بندی را
                                    انتخاب نمایید.</p>
                            </div>
                            <template v-else>
                                <v-autocomplete label="نام کالا*" v-model="state.newStoreProduct.productId"
                                    :items="state.products ? state.products : []" item-value="id" item-title="title"
                                    density="compact" variant="outlined" class="mb-2"></v-autocomplete>
                            </template>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 3">
                            <v-text-field label="عنوان*" v-model="state.newStoreProduct.specification" density="compact"
                                variant="outlined" class="mb-2"></v-text-field>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 4">
                            <div v-if="!state.attributes" class="d-flex align-center ga-1 mb-1">
                                <v-icon color="red">mdi-alert</v-icon>
                                <p class="text-red">برای انتخاب <span class="underlineText">ویژگی ها</span> باید ابتدا
                                    دسته بندی را
                                    انتخاب نمایید.</p>
                            </div>
                            <template v-else>
                                <p class="text-red"><small> مقدار پیش فرض را پر کنید در غیر اینصورت ویژگی ذخیره نخواهد
                                        شد.</small></p>
                                <template v-if="state.attributeSelectable">
                                    <v-combobox v-model="state.attributeSelected1" label="ویژگی های انتخابی"
                                        variant="outlined" density="compact" :items="state.attributeSelectable"
                                        item-title="title" class="my-3" clearable multiple chips @click:clear="clearAttributeSelected1"
                                        hide-details></v-combobox>
                                    <div class="mb-2">
                                        <div elevation="2" class="mb-3 attribute-card"
                                            v-for="item in state.attributeSelected1">
                                            <b>{{ item.title }}</b>
                                            <v-chip-group v-if="item.attributeType == constract.attributeType.select"
                                                v-model="item.selected" @update:model-value="setAttribute" column multiple>
                                                <v-chip v-for="checkbox in item.values" :text="checkbox.value"
                                                    variant="outlined" :value="checkbox" density="comfortable"
                                                    filter></v-chip>
                                            </v-chip-group>
                                        </div>
                                    </div>
                                    <v-divider class="mb-5"></v-divider>
                                </template>

                                <template v-if="state.attributeSelectable">
                                    <v-combobox v-model="state.attributeSelected2" label="ویژگی های نمایشی"
                                        variant="outlined" :items="state.attribute" density="compact" item-title="title" @click:clear="clearAttributeSelected2"
                                        class="mb-3" clearable multiple chips hide-details></v-combobox>
                                    <div class="mb-2">
                                        <div elevation="2" class="my-3 attribute-card"
                                            v-for="item in state.attributeSelected2">
                                            <b>{{ item.title }}</b>
                                            <v-chip-group v-if="item.attributeType == constract.attributeType.multi"
                                                v-model="item.selected" @update:model-value="setAttribute" column multiple>
                                                <v-chip v-for="checkbox in item.values" :text="checkbox.value"
                                                    variant="outlined" density="comfortable" :value="checkbox"
                                                    filter></v-chip>
                                            </v-chip-group>
                                            <v-text-field v-if="item.attributeType == constract.attributeType.string"
                                                v-model="item.value" @update:model-value="setAttribute" class="my-2" density="compact" variant="outlined"
                                                color="info" hide-details></v-text-field>
                                        </div>
                                    </div>
                                </template>
                            </template>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 5">
                            <v-text-field label="تعداد*" type="number" v-model="state.newStoreProduct.count"
                                @update:model-value="state.newStoreProduct.count = parseInt(state.newStoreProduct.count)"
                                density="compact" variant="outlined" class="mb-2"></v-text-field>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 6">
                            <v-text-field label="قیمت*" type="number" v-model="state.newStoreProduct.amount"
                                @update:model-value="state.newStoreProduct.amount = parseInt(state.newStoreProduct.amount)"
                                density="compact" variant="outlined" class="mb-2"></v-text-field>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 7">
                            <div v-if="!state.tags" class="d-flex align-center ga-1 mb-1">
                                <v-icon color="red">mdi-alert</v-icon>
                                <p class="text-red">برای انتخاب <span class="underlineText">تگ ها</span> باید ابتدا دسته
                                    بندی را
                                    انتخاب نمایید.</p>
                            </div>
                            <template v-else>
                                <v-autocomplete v-model="state.newStoreProduct.tagIds" label="تگ ها*" density="compact" variant="outlined" :items="state.tags" item-title="title" item-value="id" multiple
                                    class="mb-2"></v-autocomplete>
                            </template>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 8">
                            <v-textarea label="توضیحات" v-model="state.newStoreProduct.description" density="compact"
                                variant="outlined" rows="5" auto-grow class="mb-2"></v-textarea>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 9">
                            <div class="d-flex align-center ga-1 mb-1">
                                <v-icon color="red">mdi-alert</v-icon>
                                <p class="text-red">بارگزاری عکس شاخص الزامی است.</p>
                            </div>
                            <div class="d-flex align-center ga-1 mb-5">
                                <v-icon color="orange">mdi-alert</v-icon>
                                <p class="text-orange">حداکثر تعداد عکس قابل بارگزاری 5 است.</p>
                            </div>
                            <div class="text-center">
                                <s-image :src="state.selectedImage?.imageId" class="w-50" />
                            </div>
                            <div class="d-flex justify-center ga-1 mb-1 mt-1">
                                <s-image v-for="image in state.newStoreProduct.imageList" class="border"
                                    style="max-width: 50px;cursor: pointer;" :src="image.imageId"
                                    @click="state.selectedImage = image" />
                            </div>
                            <s-uploader @update:model-value="uploadImage" :hasImage="false" :multiple="true"
                                class="mt-10" />
                            <p v-if="state.imageError" class="px-5 py-1" style="color: red;">بارگزاری عکس شاخص الزامی
                                است.
                            </p>
                            <v-btn v-if="state.selectedImage" class="bg-green w-50" prepend-icon="mdi-check"
                                @click="setToPrimaryImage" :disabled="!state.selectedImage?.default ? false : true">عکس
                                شاخص</v-btn>
                            <v-btn v-if="state.selectedImage" class="bg-red w-50" prepend-icon="mdi-delete-forever"
                                @click="deleteUploadedImage">حذف</v-btn>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 10">
                            <v-radio-group v-model="state.newStoreProduct.isActive" hide-details>
                                <label class="mb-3">این کالا نمایش داده شود؟</label>
                                <div class="d-flex">
                                    <v-radio label="بله" hide-details density="compact" :value="true"></v-radio>
                                    <v-radio label="خیر" hide-details density="compact" :value="false"></v-radio>
                                </div>
                            </v-radio-group>
                        </v-card-text>
                        <v-card-text v-if="state.tab == 11">
                            <v-radio-group v-model="state.newStoreProduct.specialSale" hide-details>
                                <label class="mb-3">این کالا فروش ویژه است؟</label>
                                <div class="d-flex">
                                    <v-radio label="بله" hide-details density="compact" :value="true"></v-radio>
                                    <v-radio label="خیر" hide-details density="compact" :value="false"></v-radio>
                                </div>
                            </v-radio-group>
                        </v-card-text>
                    </v-card-item>
                </v-card>
            </v-col>
        </v-row>
    </v-form>
</template>
<style scoped>
.underlineText {
    text-decoration: underline;
}
</style>