<template>
  <ul class="tree-view">
    <TreeNode v-for="(node, index) in nodes" :key="index" :node="node" @change="handleChange" />
  </ul>
</template>

<script setup>
import { ref } from 'vue';
import TreeNode from '@/components/STreeViewNode.vue';
const props = defineProps(['modelValue'])
const emits = defineEmits(['update:modelValue'])
// تعریف داده‌های درخت
const nodes = ref([
  {
    id: 1,
    label: 'Animal',
    selected: false,
    parentId: null,
    children: [
      {
        id: 2,
        label: 'Dog',
        selected: false,
        parentId: 1,
        children: [
        {
            id: 6,
            label: 'Egyptian Mau Dog',
            selected: false,
            parentId: 2,
            children: [],
          },
          {
            id: 7,
            label: 'Japanese Bobtail Dog',
            selected: false,
            parentId: 2,
            children: [],
          },
        ],
      },
      {
        id: 3,
        label: 'Cat',
        selected: false,
        parentId: 1,
        children: [
          {
            id: 4,
            label: 'Egyptian Mau Cat',
            selected: false,
            parentId: 3,
            children: [],
          },
          {
            id: 5,
            label: 'Japanese Bobtail Cat',
            selected: false,
            parentId: 3,
            children: [],
          },
        ],
      },
    ],
  },
  {
    id: 6,
    label: 'People',
    selected: false,
    parentId: null,
    children: [],
  },
]);

const handleChange = (node) => {
  console.log('Changed node:', node);
};

</script>

<style scoped>
.tree-view {
  padding: 10px;
  border: 1px solid #ddd;
}
</style>