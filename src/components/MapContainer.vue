<template>
    <div>
        <div class="btn-container ma-4 d-flex flex-column align-center">
            <div class="d-flex flex-column justify-center">
                <v-btn
                    :small="$vuetify.breakpoint.md"
                    :x-small="$vuetify.breakpoint.smAndDown"
                    icon
                    @click="zoomIn"
                    class="zoom-btn-class plus-class"
                >
                    <v-icon>$plus</v-icon>
                </v-btn>
                <v-btn
                    :small="$vuetify.breakpoint.md"
                    :x-small="$vuetify.breakpoint.smAndDown"
                    icon
                    @click="zoomOut"
                    class="zoom-btn-class minus-class"
                >
                    <v-icon>$minus</v-icon>
                </v-btn>
            </div>
            <v-btn
                icon
                :small="$vuetify.breakpoint.md"
                :x-small="$vuetify.breakpoint.smAndDown"
                @click="zoomReset"
                class="mt-2"
            >
                <v-icon>$globe</v-icon>
            </v-btn>
        </div>
    </div>
</template>

<script>
import geoHeatmap from "./../libs/viz.js";
export default {
    name: "MapContainer",
    data() {
        return {};
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
        showTooltip(data, event) {
            console.log(data, event);
        },

        hideTooltip() {},
        initialize(covidDistData) {
            this.geoHeatmapInstance = geoHeatmap();
            this.geoHeatmapInstance.dataType(this.dataType);

            this.geoHeatmapInstance.dataRange(this.dataRange);
            this.geoHeatmapInstance.initialize(covidDistData);
            this.geoHeatmapInstance.showTooltip(this.showTooltip);
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
    },
};
</script>

<style scoped>
#map-container {
    height: 100%;
}

.zoom-btn-class {
    z-index: 100;
}

.mt-2 {
    z-index: 100;
}

.btn-container {
    position: absolute;
    right: 0;
    top: 15rem;
}

.zoom-btn-class {
    border: 1px solid hsl(0, 1%, 25%);
}

.plus-class {
    border-radius: 0.25rem 0.25rem 0 0;
}

.minus-class {
    border-radius: 0 0 0.25rem 0.25rem;
}
</style>
