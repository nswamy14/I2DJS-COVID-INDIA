<template>
    <div class="viz-container">
        <custom-popover
            :position="position"
            top
            content-class="light-theme-arrow"
            v-model="showPopover"
        >
            <v-card min-width="8rem" class="black--text white pa-1 text-center">
                <div class="d-flex align-center">
                    <div class="caption font-weight-regular">Total Cases:</div>
                    <div class="caption font-weight-bold pl-1">{{ popoverData.value }}</div>
                </div>
                <div class="caption font-weight-medium">
                    {{ popoverData.date }}
                </div>
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
        playFlag: {
            type: Boolean,
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
            this.timelineInstance.update(val, this.playFlag);
        },

        showTooltip(data, event) {
            this.popoverData = data;
            this.position = { x: event.clientX, y: event.clientY, offset: 5 };
            this.showPopover = true;
        },

        hideTooltip() {
            this.showPopover = false;
            this.debouncedMouseOver.cancel();
        },

        onTimeSelect(index, flag) {
            // this.$emit("timeSelected", index, flag);
        },
    },
};
</script>
<style>
.date-class {
    font-size: 0.7rem;
}
</style>
