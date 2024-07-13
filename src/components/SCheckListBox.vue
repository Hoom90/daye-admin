<script setup>
// import SCheckListBox from "./SCheckListBox.vue"
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue', 'change', 'selectParent'])

const chekedChange = (item) => {
    emits('update:modelValue', props.modelValue)
    selectedchildren(item)

    if (item.parentCategoryId)
        emits('selectParent', item.parentCategoryId)
}

const selectParents = (parentId) => {
    let parent = props.modelValue.find(x => x.id == parentId)
    if (parent.subCategories.some(x => x.selected))
        parent.selected = true
    else
        parent.selected = false
    emits('selectParent', parent.parentCategoryId)
    emits('change')
}

const selectedchildren = (cat) => {
    if (cat.selected) {
        if (cat.subCategories.length > 0)
            for (const item of cat.subCategories) {
                selectChildren(item, true)
            }
    }
    else {
        if (cat.subCategories.length > 0)
            for (const item of cat.subCategories) {
                selectChildren(item, false)
            }
    }
    emits('change')
}

const selectChildren = (cat, isSelected) => {
    cat.selected = isSelected
    if (cat.subCategories.length > 0)
        for (const item of cat.subCategories) {
            selectChildren(item, isSelected)
        }
}

</script>
<template>

    <li v-for="item in props.modelValue">
        <span></span>
        <v-icon icon="mdi-menu-left"></v-icon>
        <label>
            <input type="checkbox" v-model="item.selected" @change="chekedChange(item)" />
            {{ item.title }}
            <!-- --
            ({{ item.id }})
            --
            {{ item.selected }} -->
        </label>
        <ul v-if="item.subCategories.length > 0">
            <SCheckListBox v-model="item.subCategories" @change="emits('change')" @selectParent="selectParents">
            </SCheckListBox>
        </ul>
    </li>
</template>

<style>
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