<template functional>
    <div class="d-flex">
        <div
            v-for="counter in props.counters"
            :key="counter.key"
            class="ind-counter pa-2 d-flex flex-column align-center justify-start subtitle-2"
        >
            <span :class="[counter.color + '--text', 'text-uppercase']">
                {{ counter.label }}
            </span>
            <div
                class="d-flex flex-column justify-start align-center counter-content body-2"
            >
                <span :class="[counter.color + '--text', 'text--lighten-1']">
                    {{ counter.total }}
                </span>
                <div
                    v-if="counter.increaseCount"
                    class="mt-n1 d-flex align-center"
                >
                    <v-icon
                        v-if="counter.direction === 'up'"
                        key="up"
                        size="1rem"
                        :class="[counter.color + '--text', 'text--lighten-1']"
                    >
                        $arrowUp
                    </v-icon>
                    <v-icon
                        v-else
                        key="down"
                        size="1rem"
                        :class="[counter.color + '--text', 'text--lighten-1']"
                    >
                        $arrowDown
                    </v-icon>
                    <span
                        :class="[
                            counter.color + '--text',
                            'text--lighten-2 caption',
                        ]"
                    >
                        {{ counter.increaseCount }}
                    </span>
                </div>
            </div>
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
.counter-content {
    height: 2rem;
}
.sparkline-chart {
    height: 2rem;
}
</style>
