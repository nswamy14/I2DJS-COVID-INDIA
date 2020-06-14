<template>
    <div class="position-relative viz-container">
        <custom-popover
            :position="position"
            right
            center
            content-class="viz-tooltip-arrow-color"
            v-model="showPopover"
        >
            <v-card light height="150px" width="300px">
                <v-card-title class="subtitle-1">Tooltip Details will be displayed</v-card-title>
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
import geoHeatmap from "@/libs/viz";
import { debounce } from "lodash";

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
            this.debouncedMouseOver = debounce(this.showTooltip.bind(this), 300);

            this.geoHeatmapInstance = geoHeatmap();
            this.geoHeatmapInstance.dataType(this.dataType);

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
            console.log(data.d.name);
            this.popoverData = data;
            this.position = { x: event.clientX, y: event.clientY, offset: 18 };
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
