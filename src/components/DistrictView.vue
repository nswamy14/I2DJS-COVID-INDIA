<template>
    <v-card class="mt-2 card-background">
        <v-card-title class="text-capitalize font-weight-bold justify-center card-title-color">
            {{ districtInfo.district }}
        </v-card-title>
        <v-card-text class="align-center justify-center">
            <div class="counters-container grid">
                <div
                    v-for="counter in counters"
                    :key="counter.key"
                    class="d-flex align-center mb-2"
                >
                    <div :class="[counter.key, 'color', [$vuetify.breakpoint.name]]"></div>
                    <span class="subtitle-2 mx-2 counter-label"> {{ counter.label }} Cases </span>
                    <span class="font-weight-bold black--text mr-2">
                        {{ counter.total }}
                    </span>
                    <v-chip
                        v-if="counter.delta"
                        outlined
                        small
                        class="ml-auto"
                        :color="
                            counter.direction === 'up' && counter.key !== 'recovered'
                                ? 'red darken-2'
                                : 'green darken-2'
                        "
                    >
                        <v-icon
                            left
                            v-if="counter.direction === 'up'"
                            key="up"
                            small
                            :x-small="$vuetify.breakpoint.smAndDown"
                        >
                            $arrowUp
                        </v-icon>
                        <v-icon
                            v-else
                            key="down"
                            small
                            left
                            :x-small="$vuetify.breakpoint.smAndDown"
                        >
                            $arrowDown
                        </v-icon>
                        <span class="body-2">
                            {{ counter.delta }}
                        </span>
                    </v-chip>
                </div>
            </div>
            <template v-if="districtInfo.data && districtInfo.data.length > 0">
                <div class="mt-4 text-center subtitle-1 black--text">
                    Activity in the past 45 days
                </div>
                <div class="toolbar-timeline-container">
                    <stack-bar-chart :timelineData="districtInfo.data" id="district_stackline">
                    </stack-bar-chart>
                </div>
            </template>
        </v-card-text>
    </v-card>
</template>

<script>
import StackBarChart from "./StackBarChart";
import { isEmpty } from "lodash";
import { convertToIndianFormat } from "./helper";
export default {
    name: "DistrictView",
    components: { StackBarChart },
    data() {
        return {
            counters: [],
        };
    },
    props: {
        districtInfo: {
            type: Object,
            required: true,
        },
    },
    watch: {
        districtInfo() {
            this.initializeDistrictData();
        },
    },

    mounted() {
        this.initializeDistrictData();
    },

    methods: {
        initializeDistrictData() {
            let districtInfo = this.districtInfo || { data: [] };
            let length = districtInfo.data.length;
            let previousDayRecord = districtInfo.data[length - 2] || {};
            if (isEmpty(previousDayRecord)) {
                previousDayRecord = {
                    confirmed: 0,
                    active: 0,
                    deceased: 0,
                    recovered: 0,
                };
            }

            this.counters = [
                {
                    label: "Confirmed",
                    key: "confirmed",
                    total: convertToIndianFormat(districtInfo.confirmed),
                    direction:
                        districtInfo.confirmed - previousDayRecord.confirmed < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(districtInfo.confirmed - previousDayRecord.confirmed)
                    ),
                },
                {
                    label: "Active",
                    key: "active",
                    total: convertToIndianFormat(districtInfo.active),
                    direction: districtInfo.active - previousDayRecord.active < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(districtInfo.active - previousDayRecord.active)
                    ),
                },
                {
                    label: "Deceased",
                    key: "deceased",
                    total: convertToIndianFormat(districtInfo.deceased),
                    direction:
                        districtInfo.deceased - previousDayRecord.deceased < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(districtInfo.deceased - previousDayRecord.deceased)
                    ),
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    total: convertToIndianFormat(districtInfo.recovered),
                    direction:
                        districtInfo.recovered - previousDayRecord.recovered < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(districtInfo.recovered - previousDayRecord.recovered)
                    ),
                },
            ];
        },
    },
};
</script>
<style scoped>
.card-background {
    background-color: hsla(0, 0%, 100%, 0.85);
}
.counters-container {
    width: 70%;
    margin: 0 auto;
    display: flex;
    flex-flow: column nowrap;
}

.counters-container.grid {
    display: grid;
    justify-content: center;
}

.card-title-color {
    color: hsla(0, 0%, 0%, 0.8);
}

.counter-label {
    width: 8rem;
    color: hsla(0, 0%, 0%, 0.9);
}

.toolbar-timeline-container {
    width: 100%;
    height: 10rem;
}
</style>
