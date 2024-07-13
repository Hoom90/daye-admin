<script setup>
const state = reactive({
  value: 20
});
</script>
<template>
  <v-row>
    <v-col cols="4">
      <v-card>
        <v-card-text>
          <div class="d-lg-flex align-center justify-center text-center">
            <span>مقدار فروش امروز</span>
            <v-progress-circular
            :model-value="state.value"
            :rotate="360"
            :size="100"
            :width="5"
            color="teal"
            class="ms-auto"
          >
            {{ state.value }}
          </v-progress-circular>
          </div>

        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="4">
      <v-card>
        <v-card-text>
          <div class="d-lg-flex align-center justify-center text-center">
            <span>مقدار فروش امروز</span>
            <v-progress-circular
            :model-value="state.value"
            :rotate="360"
            :size="100"
            :width="5"
            color="teal"
            class="ms-auto"
          >
            {{ state.value }}
          </v-progress-circular>
          </div>

        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="4">
      <v-card>
        <v-card-text>
          <div class="d-lg-flex align-center justify-center text-center">
            <span>مقدار فروش امروز</span>
            <v-progress-circular
            :model-value="state.value"
            :rotate="360"
            :size="100"
            :width="5"
            color="teal"
            class="ms-auto"
          >
            {{ state.value }}
          </v-progress-circular>
          </div>

        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

