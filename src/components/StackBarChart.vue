<template>
    <div class="viz-container" :id="id"></div>
</template>

<script>
import stackBarChart from "./../libs/stackBarChart.js";
export default {
    name: "TimelineView",
    data() {
        return {};
    },
    props: {
        timelineData: {
            type: Array,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
    mounted() {
        this.initialize();
    },
    watch: {
        timelineData(data) {
            this.update(data);
        },
    },
    methods: {
        initialize() {
            this.timelineInstance = stackBarChart();
            this.timelineInstance.containerId(this.id);
            this.timelineInstance.initialize(this.timelineData);
        },

        update(data) {
            this.timelineInstance.update(data);
        },
    },
};
</script>
<style scoped>
.viz-container {
    height: 100%;
}
</style>
