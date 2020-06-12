<template>
    <div class="viz-container" :id="id"></div>
</template>

<script>
import sparklineChart from "./../libs/sparkline.js";
export default {
    name: "SparkLine",
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
        initialize() {
            this.sparklineInstance = sparklineChart();
            this.sparklineInstance.containerId(this.id);
            this.sparklineInstance.initialize();
            this.sparklineInstance.timelineData(this.timelineData);
        },

        update() {
            this.sparklineInstance.timelineData(this.timelineData);
        },
    },
};
</script>
