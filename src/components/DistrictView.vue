<template>
    <v-card light class="mt-2" :class="[$vuetify.breakpoint.xs ? 'card-background' : '']">
        <v-card-title class="text-capitalize font-weight-bold justify-center">
            {{ districtInfo.name }}
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
                <div class="mt-3 mb-1 text-center subtitle-1 black--text">
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
import { convertToIndianFormat } from "./helper";
import _ from "lodash";

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
            let currDayRecord = districtInfo || {};
            let dayRecord = districtInfo.data[length - 1] || {};
            let previousDayRecord = districtInfo.data[length - 2] || {};
            if (_.isEmpty(previousDayRecord)) {
                previousDayRecord = {
                    confirmed: 0,
                    active: 0,
                    deceased: 0,
                    recovered: 0,
                };
            }
            if (_.isEmpty(dayRecord)) {
                dayRecord = {
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
                    total: convertToIndianFormat(currDayRecord.confirmed),
                    direction:
                        dayRecord.confirmed - previousDayRecord.confirmed < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(dayRecord.confirmed - previousDayRecord.confirmed)
                    ),
                },
                {
                    label: "Active",
                    key: "active",
                    total: convertToIndianFormat(currDayRecord.active),
                    direction: dayRecord.active - previousDayRecord.active < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(dayRecord.active - previousDayRecord.active)
                    ),
                },
                {
                    label: "Deceased",
                    key: "deceased",
                    total: convertToIndianFormat(currDayRecord.deceased),
                    direction: dayRecord.deceased - previousDayRecord.deceased < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(dayRecord.deceased - previousDayRecord.deceased)
                    ),
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    total: convertToIndianFormat(currDayRecord.recovered),
                    direction:
                        dayRecord.recovered - previousDayRecord.recovered < 0 ? "down" : "up",
                    delta: convertToIndianFormat(
                        Math.abs(dayRecord.recovered - previousDayRecord.recovered)
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

.counter-label {
    width: 8rem;
}

.toolbar-timeline-container {
    width: 100%;
    height: 8rem;
}
</style>
