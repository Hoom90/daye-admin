<script setup>
const url = import.meta.env.VITE_FILE_URL
import no_image from '@/assets/img/no-image-icon.png'
import axios from "axios"
const props = defineProps(["modelValue","class","disabled","multiple","style","alt","hasImage","hasButton","text","btnClass","label","labelClass","isPrivate"])
const emits = defineEmits(["update:modelValue"])
const image = ref(no_image)
const input = ref()
const loading =ref(false)

onMounted(() => {
  if (props.modelValue && props.modelValue != ''){
    show(`${url}/${props.modelValue}`)
  }
})

watch(() => (props.modelValue), () => {
  if (props.modelValue && props.modelValue != ''){
    show(`${url}/${props.modelValue}`)
  }
})

const show = async (url) =>{
  const config = {
    responseType: 'blob',
    timeout: 40 * 1000,
    headers: {
      // "Content-Type": "application/json;charset=UTF-8",
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


const fileUploadSelect = (event) => {
  loading.value = true
  let files = event.target.files
  for(let file of files){
    if (file) {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("IsPrivate", props.isPrivate ?? true);
      uploadFile(formData)
    }
  }
}

async function uploadFile(formData) {
  // const onUploadProgress = (event) => {
  //   const percentage = Math.round((100 * event.loaded) / event.total);
  //   state.uploadButtonText = `درحال ذخیره: ${percentage}%`
  //   if (percentage > 98) {
  //     setTimeout(() => {
  //       uploadButtonText('ذخیره شد')
  //     }, 2000);
  //   }
  // };

  let uploadedImage = await axios.post(url,formData,{
      timeout: 20 * 1000,
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
        "authorization" : `Bearer ${localStorage.getItem('token')}`,
      },
  })
  .then(r => r.data)
  .then(r => r.data)
  .catch(e => console.error(e?.data?.messages))
  loading.value = false
  show(`${url}/${uploadedImage.imageId}`)
  emits("update:modelValue", uploadedImage.imageId)
}
</script>

<template>
  <div :class="[props.disabled ? 'container' : 'selectableContainer',`${props.class ?? ''}`]" @click="loading && (props.disabled ?? false) ? '' : input.click()" :style="props.style">
    <p :class="props.labelClass">{{ props.label }}</p>
    <img v-if="props.hasImage ?? true" :src="image" class="image" :alt="props.alt"/>
    <input v-if="!loading" ref="input" type="file" class="input" @change="fileUploadSelect" accept="image/png, image/gif, image/jpeg" :multiple="props.multiple ?? false" :disabled="props.disabled">
    <div class="loading" :class="loading ? 'loading-enable':'loading-disable'">
      <svg class="loading-icon" fill="#aaa" width="50px" height="50px" viewBox="0 0 1024 1024">
        <path d="M512 1024c-69.1 0-136.2-13.5-199.3-40.2C251.7 958 197 921 150 874c-47-47-84-101.7-109.8-162.7C13.5 648.2 0 581.1 0 512c0-19.9 16.1-36 36-36s36 16.1 36 36c0 59.4 11.6 117 34.6 171.3 22.2 52.4 53.9 99.5 94.3 139.9 40.4 40.4 87.5 72.2 139.9 94.3C395 940.4 452.6 952 512 952c59.4 0 117-11.6 171.3-34.6 52.4-22.2 99.5-53.9 139.9-94.3 40.4-40.4 72.2-87.5 94.3-139.9C940.4 629 952 571.4 952 512c0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 0 0-94.3-139.9 437.71 437.71 0 0 0-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.2C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3s-13.5 136.2-40.2 199.3C958 772.3 921 827 874 874c-47 47-101.8 83.9-162.7 109.7-63.1 26.8-130.2 40.3-199.3 40.3z" />
      </svg>
    </div>
    <template v-if="!props.disabled ?? true">
      <button v-if="props.hasButton ?? true" type="button" class="btn" :class="props.btnClass" @click="loading && (props.disabled ?? true) ? '' : input.click()">{{ props.text ? props.text : 'بارگزاری عکس' }}</button>
    </template>
  </div>
</template>

<style scoped>
.selectableContainer{
  position: relative;
  cursor: pointer;
}
.container{
  position: relative;
}
.image{
  width: 100%;
  height: 100%;
}
.input{
  display: none;
}
.btn{
  background-color: #2196F3;
  width: 100%;
  border-radius: 3px;
  height: 40px;
  color: #ffffff;
  transition: all linear .1s;
  margin-bottom: 5px;
}
.btn:hover{
  background-color: #1b84db;
}
.loading{
  background-color: #eee;
  width: 100%;
  height: 100%;
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s ease-in-out;
}
.loading-disable{
  opacity: 0;
  z-index: 0;
}
.loading-enable{
  opacity: 1;
  z-index: 99;
}
.loading-icon{
  animation: rotation 1s linear infinite;
}
@keyframes rotation {
  0% {
    transform: rotate(0deg)
  }
  100% {
    transform: rotate(361deg)
  }
}
</style>