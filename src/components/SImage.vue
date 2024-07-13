<script setup>
import no_image from '@/assets/img/no-image-icon.png'
import axios from "axios"
const url = import.meta.env.VITE_FILE_URL
const props = defineProps(['src', 'path', 'class', 'alt', 'style'])
const emits = defineEmits(["update:modelValue","click"]) 
const image = ref(no_image)

onMounted(() => {
  if (props.src && props.src != ''){
    show(`${url}/${props.src}`)
  }
})

watch(()=>props.src,()=>{
  if (props.src && props.src != ''){
    show(`${url}/${props.src}`)
  }
})

const show = async (url) =>{
  const config = {
    responseType: 'blob',
    timeout: 40 * 1000,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
      "authorization" : `Bearer ${localStorage.getItem('token')}`,
    },
  };

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  await axios.get(url, config).then(async (response) => {
    image.value = await toBase64(new File([response.data], 'str'))
  });
}

</script>
<template>
  <img :src="image" :class="props.class" :style="props.style" :alt="props.alt" @click="emits('click')"/>
</template>
<style scoped>
img{
  width: 100%;
  object-fit: contain;
  aspect-ratio: 1;
}
</style>