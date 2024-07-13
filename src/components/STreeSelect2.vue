<script setup>
import SCheckListBox from "@/components/SCheckListBox"
const props = defineProps(['modelValue', 'selected'])
const emits = defineEmits(['update:modelValue', 'update:selected', 'selectParent'])
let state = reactive({
    selected:[],
})

const checkedChange = (checkbox) => {
    if (checkbox.selected) selectChildren(checkbox, true, checkbox.subCategories)
    else selectChildren(checkbox, false, checkbox.subCategories)

    if (!checkbox.parentCategoryId) emits('update:selected', state.selected)
    else emits('selectParent', checkbox.parentCategoryId,state.selected)
}

const selectChildren = (selectedItem, status, children) => {
    selectedItem.selected = status
    if (status) state.selected.push(selectedItem.appCategoryId)
    else state.selected = state.selected.filter(x => x != selectedItem.appCategoryId)
    if (children.length > 0) {
        for (const child of children) {
            selectChildren(child, status, child.subCategories)
        }
    }
}

const selectParents = (parentId,selected) => {
    state.selected = selected
    let parent = props.modelValue.find(x => x.id == parentId)
    if (parent.subCategories.some(x => x.selected)){
        if(!parent.selected){
            parent.selected = true
            state.selected.push(parent.appCategoryId)
        }
    }
    else{
        parent.selected = false
        state.selected = state.selected.filter(x => x != parent.appCategoryId)
    }
    emits('update:selected', state.selected)
    emits('selectParent', parent.parentCategoryId,state.selected)
}

// onMounted(()=>{
//     initSelecteds(props.modelValue)
// })

// const initSelecteds = (categories) => {
//   for (const category of categories) {
//     if (props.selected?.some(x => x == category.appCategoryId)) category.selected = true
//     if (category.subCategories.length > 0) initSelecteds(category.subCategories)
//   }
// }
</script>
<template>
    <li v-for="item in props.modelValue">
        <span></span>
        <v-icon icon="mdi-menu-left"></v-icon>
        <label>
            <input type="checkbox" v-model="item.selected" @change="checkedChange(item)" />
            {{ item.title }}
            --
            ({{ item.appCategoryId }})
            --
            ({{ item.parentCategoryId }})
            --
            {{ item.selected }}
        </label>
        <ul v-if="item.subCategories.length > 0">
            <s-check-list-box
            v-model="item.subCategories"
            :selected="props.selected"
            @update:selected="(value) => state.selected = value"
            @selectParent="selectParents"
             />
        </ul>
    </li>
</template>

<style scoped>
.check-list-box ul {
    padding-right: 20px;
    /* border-right: dashed 1px #757575; */
}

.check-list-box li {
    /* padding-top: 10px; */
    /* padding-right: 20px; */
    text-decoration: none;
    list-style-type: none;
}

.check-list-box label {
    cursor: pointer;
}

.check-list-box span {
    width: 10px;
    height: 15px;
    display: inline-block;
    margin-bottom: 3px;
    border-right: dashed 1px #757575;
    border-bottom: dashed 1px #757575;
}
</style>