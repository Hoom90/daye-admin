<script setup>
import { useDisplay } from 'vuetify'

const props = defineProps(['modelValue', 'title', 'cancelBtn', 'cancelText', 'actionBtn', 'actionBtnText', 'actionType', 'size'])
const emits = defineEmits(['update:modelValue', 'actionCallback'])

// const visible = ref(props.modelValue)
// watch(() => props.modelValue, () => visible.value = props.modelValue)
// watch(() => visible.value, () => emits('update:modelValue', visible.value))


const { name } = useDisplay()

const width = computed(() => {
    let size = normalizedSize(props.size??'xs')
    let nameSize = normalizedSize(name.value)

    switch (Math.min(size, nameSize)) {
        // case 0: return '90%'
        case 1: return 400
        case 2: return 550
        case 3: return 900
        case 4: return 1200
        case 5: return 1800
        case 6: return 2000
    }
})

const normalizedSize = (size) => {
    switch (size) {
        case 'xs': return 1
        case 'sm': return 2
        case 'md': return 3
        case 'lg': return 4
        case 'xl': return 5
        case 'xxl': return 6
    }
}


</script>

<template>
 
    <v-dialog v-model="props.modelValue" transition="dialog-bottom-transition" :width="width" @update:modelValue="emits('update:modelValue', false)">
        <v-card>
            <v-toolbar dark class="bg-blue-grey-lighten-1">
                <v-btn icon dark @click="emits('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>{{ props.title }}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items>
                    <!-- <v-btn
              variant="text"
              @click="dialog = false"
            >
              Save
            </v-btn> -->
                </v-toolbar-items>
            </v-toolbar>
            <div class="pa-3">
                <slot> </slot>
            </div>
            <div v-if="props.cancelBtn && props.actionBtn">

                <hr class="my-3" />
                <div class="d-flex mb-3">
                    <span class="ms-auto">
                        <v-btn variant="text" v-if="props.cancelBtn" color="info" @click="emits('actionCallback', false)">{{
                            props.cancelText ?? 'انصراف' }}</v-btn>
                        <v-btn variant="tonal" v-if="props.actionBtn" :color="props.actionType ?? 'success'" class="mx-3"
                            @click="emits('actionCallback', true)">{{ props.actionBtnText ?? 'تائید' }} </v-btn>
                    </span>
                </div>

            </div>
        </v-card>
    </v-dialog>
</template>