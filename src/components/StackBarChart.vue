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
            type: Object,
            required: true,
        },
        id: {
            type: String,
            required: true,
        },
    },
    mounted() {
        this.initialize(this.timelineData);
    },
    watch: {
        timelineData: {
            handler(val) {
                this.update();
            },
            deep: true,
        },
    },
    methods: {
        initialize(data) {
            this.timelineInstance = stackBarChart();
            this.timelineInstance.containerId(this.id);
            this.timelineInstance.initialize(this.timelineData.data);
        },

        update() {
            console.log(this.timelineData);
            this.timelineInstance.update(this.timelineData.data);
        },
    },
};
</script>
<style scoped>
.viz-container {
    height: 100%;
}
</style>
