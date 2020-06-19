<template>
    <div class="viz-container" :id="id">
        <custom-popover
            :position="position"
            top
            start
            content-class="dark-theme-arrow"
            v-model="showPopover"
        >
            <v-card min-width="10rem" class="pa-2">
                <div class="body-2 font-weight-bold text-center mt-n1 py-2">
                    {{ formatDate(popoverData.date) }}
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover confirmed"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">CONFIRMED</span>
                    <span class="font-weight-bold ml-auto">
                        {{ popoverData.confirmed }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover active"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">ACTIVE</span>
                    <span class="font-weight-bold ml-auto">
                        {{ popoverData.active }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover recovered"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">RECOVERED</span>
                    <span class="font-weight-bold ml-auto">
                        {{ popoverData.recovered }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover deceased"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">DECEASED</span>
                    <span class="font-weight-bold ml-auto">
                        {{ popoverData.deceased }}
                    </span>
                </div>
            </v-card>
        </custom-popover>
    </div>
</template>

<script>
import _ from "lodash";
import stackBarChart from "./../libs/stackBarChart.js";
import formatDataMixin from "../mixins/formatDataMixin";
export default {
    name: "TimelineView",
    mixins: [formatDataMixin],
    data() {
        return {
            showPopover: false,
            position: {},
            popoverData: {},
        };
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
            this.debouncedMouseOver = _.debounce(this.showTooltip.bind(this), 300);
            this.timelineInstance = stackBarChart();
            this.timelineInstance.containerId(this.id);
            this.timelineInstance.initialize(this.timelineData);
            this.timelineInstance.showTooltip(this.debouncedMouseOver);
            this.timelineInstance.hideTooltip(this.hideTooltip);
        },

        update(data) {
            this.timelineInstance.update(data);
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
    },
};
</script>
<style scoped>
.viz-container {
    height: 100%;
}
</style>
