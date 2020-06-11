<template functional>
  <div v-if="props.counters" class="counters-container">
    <div
      v-for="counter in props.counters"
      :key="counter.key"
      class="ind-counter pa-2 d-flex flex-column align-center justify-start"
    >
      <span :class="counter.key + '-label-color'">
        {{ counter.label }}
      </span>
      <div
        v-if="counter.total"
        class="d-flex flex-column justify-start counter-content"
      >
        <span :class="counter.key + '-count-color'">
          {{ counter.total }}
        </span>
        <div v-if="counter.increaseCount" class="mt-n2">
          <v-icon size="1rem" :class="[counter.key + '-count-color', 'ml-n1']">
            $arrowUp
          </v-icon>
          <span :class="[counter.key + '-count-color', 'font-min', 'ml-n1']">
            {{ counter.increaseCount }}
          </span>
        </div>
      </div>
      <div v-else class="counter-content"></div>
      <div class="sparkline-chart">
        Spark Line
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CountersView",
  data() {
    return {};
  },
};
</script>
<style scoped>
.counters-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, 6rem);
  grid-gap: 1rem;
}
.ind-counter {
  background-color: hsla(0, 0%, 12%, 0.7);
  border-radius: 0.5rem;
}

.active-label-color {
  color: hsl(210, 100%, 50%);
}

.active-count-color {
  color: hsl(210, 100%, 65%);
}

.confirmed-label-color {
  color: hsl(0, 100%, 60%);
}

.confirmed-count-color {
  color: hsl(0, 100%, 70%);
}

.death-label-color {
  color: hsla(0, 0%, 55%, 1);
}

.death-count-color {
  color: hsla(0, 0%, 70%, 1);
}

.recovered-label-color {
  color: hsl(120, 89%, 35%);
}

.recovered-count-color {
  color: hsl(120, 89%, 45%);
}
.font-min {
  font-size: 0.8rem;
}

.counter-content {
  height: 2.5rem;
}

.sparkline-chart {
  height: 2rem;
}
</style>
