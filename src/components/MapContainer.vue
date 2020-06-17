<template>
    <div class="position-relative viz-container">
        <custom-popover
            :position="position"
            top
            center
            content-class="light-theme-arrow"
            v-model="showPopover"
        >
            <v-card light width="12rem" class="pa-3">
                <div class="subtitle-1 text-center text-capitalize">
                    {{ popoverData.label }}
                </div>
                <div class="body-2 font-weight-bold text-center mb-3 text-capitalize">
                    {{ popoverData.state }}
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover confirmed"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">CONFIRMED</span>
                    <span class="font-weight-bold black--text ml-auto">
                        {{ popoverData.confirmed }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover active"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">ACTIVE</span>
                    <span class="font-weight-bold black--text ml-auto">
                        {{ popoverData.active }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover recovered"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">RECOVERED</span>
                    <span class="font-weight-bold black--text ml-auto">
                        {{ popoverData.recovered }}
                    </span>
                </div>
                <div class="d-flex align-center px-2 caption">
                    <div
                        class="color popover deceased"
                        :class="[[this.$vuetify.breakpoint.name]]"
                    ></div>
                    <span class="mx-1">DECEASED</span>
                    <span class="font-weight-bold black--text ml-auto">
                        {{ popoverData.deceased }}
                    </span>
                </div>
            </v-card>
        </custom-popover>
        <div
            :class="[[this.$vuetify.breakpoint.name]]"
            class="btn-container d-flex flex-column align-center"
        >
            <div class="d-flex flex-column justify-center">
                <v-tooltip :open-delay="200" left transition="fade-transition">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="zoomIn"
                            class="plus-class"
                            color="grey lighten-5"
                            icon
                            outlined
                            v-on="on"
                        >
                            <v-icon>$plus</v-icon>
                        </v-btn>
                    </template>
                    Zoom In
                </v-tooltip>
                <v-tooltip :open-delay="200" left transition="fade-transition">
                    <template v-slot:activator="{ on }">
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="zoomOut"
                            class="minus-class"
                            color="grey lighten-5"
                            icon
                            outlined
                            v-on="on"
                        >
                            <v-icon>$minus</v-icon>
                        </v-btn>
                    </template>
                    Zoom Out
                </v-tooltip>
            </div>
            <v-tooltip :open-delay="200" left transition="fade-transition">
                <template v-slot:activator="{ on }">
                    <v-btn
                        :small="$vuetify.breakpoint.md"
                        :x-small="$vuetify.breakpoint.smAndDown"
                        @click="zoomReset"
                        class="mt-2"
                        color="grey lighten-5"
                        icon
                        v-on="on"
                    >
                        <v-icon>$globe</v-icon>
                    </v-btn>
                </template>
                Reset Zoom
            </v-tooltip>
        </div>
    </div>
</template>

<script>
import _ from "lodash";
import geoHeatmap from "@/libs/viz";
import { GEO_JSON } from "./helper";

export default {
    name: "MapContainer",
    data() {
        return {
            showPopover: false,
            position: {},
            popoverData: {},
        };
    },
    props: {
        dataType: {
            type: String,
            required: true,
        },
        searchGeoLocation: {
            type: Object,
            required: false,
        },
        covidDistrictData: {
            type: Array,
            required: true,
        },
        dataRange: {
            type: Array,
            required: true,
        },
        latlongData: {
            type: Object,
            required: true,
        },
    },
    mounted() {
        this.initialize(this.covidDistrictData);
    },

    watch: {
        covidDistrictData: {
            handler(val) {
                this.update();
            },
            deep: true,
        },
        searchGeoLocation(val) {
            this.geoHeatmapInstance.zoomToLocation(val);
        },
        dataRange(range) {
            this.geoHeatmapInstance.dataRange(range);
        },
        dataType(val) {
            this.geoHeatmapInstance.dataType(this.dataType);
            this.geoHeatmapInstance.update();
        },
    },

    methods: {
        initialize(covidDistData) {
            this.debouncedMouseOver = _.debounce(this.showTooltip.bind(this), 300);

            this.geoHeatmapInstance = geoHeatmap();
            this.geoHeatmapInstance.dataType(this.dataType);
            this.geoHeatmapInstance.latlongData(this.latlongData);
            this.geoHeatmapInstance.geoJSON(GEO_JSON);
            this.geoHeatmapInstance.dataRange(this.dataRange);
            this.geoHeatmapInstance.initialize(covidDistData);
            this.geoHeatmapInstance.showTooltip(this.debouncedMouseOver);
            this.geoHeatmapInstance.hideTooltip(this.hideTooltip);
        },

        update() {
            this.geoHeatmapInstance.update();
        },

        zoomReset() {
            this.geoHeatmapInstance.mapRest();
        },

        zoomIn() {
            this.geoHeatmapInstance.zoomIn();
        },

        zoomOut() {
            this.geoHeatmapInstance.zoomOut();
        },

        showTooltip(data, event) {
            this.popoverData = data.d;
            this.position = { x: event.clientX, y: event.clientY, offset: 10 };
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
.btn-container {
    z-index: 10;
    position: absolute;
    right: 0;
    top: 15rem;
    margin: 1rem;
}

.btn-container.sm,
.btn-container.xs {
    top: 0;
    margin: 0.5rem;
}

.zoom-btn-class {
    border: 1px solid;
}

.plus-class {
    border-radius: 0.25rem 0.25rem 0 0;
}

.minus-class {
    border-radius: 0 0 0.25rem 0.25rem;
}
</style>
