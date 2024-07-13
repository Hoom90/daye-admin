<template>
  <li class="tree-node">
    <label class="node-header">
      <span></span>
      <input type="checkbox" v-model="node.selected" @change="emitChange" />
      {{ node.label }}
    </label>
    <ul class="node-children">
      <TreeNode v-for="(child, index) in node.children" :key="index" :node="child" @change="emitChange" />
    </ul>
  </li>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import TreeNode from '@/components/STreeViewNode.vue';

// تعریف props
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
});

// تعریف event emitter
const emit = defineEmits(['change']);

// ارسال تغییرات گره به بالا
const emitChange = () => {
  if(props.node.parentId) emit('change', node.props.selected);
  else updateChildSelection(props.node ,props.node.selected)
  console.log(props.node);
  emit('change', props.node);
};

const updateChildSelection = (node, isSelected) =>{
  if(node.children && node.children.length > 0){
    node.children.forEach(child => {
      child.selected = isSelected
      updateChildSelection(child, isSelected)
    })
  }
}
</script>

<style scoped>
.tree-node {
  margin-left: 20px;
}

.node-header {
  cursor: pointer;
}
</style>