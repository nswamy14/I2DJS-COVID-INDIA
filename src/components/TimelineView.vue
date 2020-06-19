<template>
    <div class="viz-container">
        <custom-popover
            :position="position"
            top
            content-class="light-theme-arrow"
            v-model="showPopover"
        >
            <v-card min-width="6rem" class="black--text white pa-1 text-center">
                <div class="body-2">Total Cases</div>
                <div class="caption font-weight-bold">{{ popoverData }}</div>
            </v-card>
        </custom-popover>
    </div>
</template>

<script>
import _ from "lodash";
import timelineBarChart from "./../libs/timelineBarChart.js";

export default {
    name: "TimelineView",
    data() {
        return {
            showPopover: false,
            position: {},
            popoverData: {},
        };
    },
    props: {
        timelineData: {
            type: Object,
            required: true,
        },
    },
    mounted() {
        this.initialize();
    },
    watch: {
        timelineData: {
            handler(val) {
                this.update(val);
            },
            deep: true,
        },
    },
    methods: {
        initialize() {
            this.debouncedMouseOver = _.debounce(this.showTooltip.bind(this), 300);
            this.timelineInstance = timelineBarChart();
            this.timelineInstance.dataRange(this.timelineData.scale);
            this.timelineInstance.dateCount(this.timelineData.dateCount);
            this.timelineInstance.initialize(this.timelineData);
            this.timelineInstance.showTooltip(this.debouncedMouseOver);
            this.timelineInstance.hideTooltip(this.hideTooltip);
            this.timelineInstance.onTimeSelector(this.onTimeSelect);
        },

        update(val) {
            this.timelineInstance.update(val);
        },

        showTooltip(data, event) {
            this.popoverData = data.value;
            this.position = { x: event.clientX, y: event.clientY, offset: 5 };
            this.showPopover = true;
        },

        hideTooltip() {
            this.showPopover = false;
            this.debouncedMouseOver.cancel();
        },

        onTimeSelect(index) {
            this.$emit("timeSelected", index);
        },
    },
};
</script>
