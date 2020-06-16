<template>
    <div class="d-flex justify-space-around">
        <div
            v-for="counter in counters"
            :key="counter.key"
            class="ind-counter pa-2 d-flex flex-column align-center justify-start subtitle-2"
        >
            <span :class="[counter.color + '--text', 'text-uppercase']">
                {{ counter.label }}
            </span>
            <div class="d-flex flex-column justify-start align-center counter-content body-2 mb-1">
                <span :class="[counter.color + '--text', 'text--lighten-1']">
                    {{ counter.total }}
                </span>
                <div
                    v-if="counter.increaseCount"
                    class="d-flex align-center counter-indicator-container"
                >
                    <v-icon size="1rem" :class="[counter.color + '--text', 'text--accent-4']">
                        {{ counter.direction === "up" ? "$arrowUp" : "$arrowDown" }}
                    </v-icon>
                    <span :class="[counter.color + '--text', 'text--accent-4 caption']">
                        {{ counter.increaseCount }}
                    </span>
                </div>
            </div>
            <div class="sparkline-chart">
                <spark-line :timelineData="counter" :id="counter.label + '_sparkline'">
                </spark-line>
            </div>
        </div>
    </div>
</template>

<script>
import SparkLine from "./SparkLine";
export default {
    name: "CountersView",
    components: { SparkLine },
    data() {
        return {};
    },

    props: {
        counters: {
            type: Array,
            required: true,
        },
    },
};
</script>
<style scoped>
.ind-counter {
    min-width: 6rem;
}
.counter-content {
    height: 2rem;
}
.counter-indicator-container {
    margin-top: -0.1rem;
}
.sparkline-chart {
    height: 2rem;
    width: 100%;
}
</style>
