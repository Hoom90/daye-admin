<script setup>
import no_image from '@/assets/img/no-image-icon.png';
import axios from 'axios';

const url = import.meta.env.VITE_FILE_URL;
const props = defineProps(['src', 'path', 'class', 'noImage', 'ratio', 'isThumbnail', 'alt', 'style', 'public']);
const emits = defineEmits(['update:modelValue', 'click']);
const image = ref(no_image);

const show = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: 'blob',
      timeout: 40000,
      headers: {
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const reader = new FileReader();
    reader.onload = () => (image.value = reader.result);
    reader.readAsDataURL(new File([response.data], 'str'));
  } catch (error) {
    console.error('Error fetching image:', error);
  }
};

const loadImage = () => {
  if (props.src) {
    show(`${url}/${props.src}`);
  } else if (props.path) {
    image.value = props.path;
  }
};

onMounted(loadImage);
watch(() => props.src, loadImage);
watch(() => props.path, loadImage);
</script>

<template>
  <img :src="image" :class="props.class" :style="[props.style, props.ratio ? { 'aspect-ratio': props.ratio } : '']" :alt="props.alt ?? 'دایه'" @click="emits('click')" />
</template>

<style scoped>
img {
  width: 100%;
  object-fit: contain;
  aspect-ratio: 1;
}
</style>
