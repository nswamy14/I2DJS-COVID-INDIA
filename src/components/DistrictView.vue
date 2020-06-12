<template>
    <v-card light class="mt-2">
        <div class="toolbar-header d-flex justify-center pb-2 font-weight-bold secondary--text">
            {{ districtName | titleCase }}
        </div>
        <div class="d-flex flex-column">
            <div v-for="counter in countersArr" :key="counter.key" class="ind-row-content">
                <span :class="['d-flex', 'justify-end', counter.key + '-label-color']">
                    {{ counter.label }}:
                </span>
                <div :class="counter.key + '-count-color'">
                    <span class="toolbar-count">
                        {{ counter.total }}
                    </span>
                    <template v-if="counter.increase">
                        <v-icon
                            v-if="counter.direction === 'up'"
                            key="up"
                            size="1rem"
                            :class="[counter.key + '-count-color', 'ml-n1']"
                        >
                            $arrowUp
                        </v-icon>
                        <v-icon
                            v-else
                            key="down"
                            size="1rem"
                            :class="[counter.key + '-count-color', 'ml-n1']"
                        >
                            $arrowDown
                        </v-icon>
                        <span class="ml-n1 font-min">
                            {{ counter.increase || 0 }}
                        </span>
                    </template>
                </div>
            </div>
        </div>
        <div class="toolbar-timeline-container pt-2">
            Last 45 days Timeline:
            <stack-bar-chart :timelineData="districtInfo" :id="districtInfo.dis + '_stackline'">
            </stack-bar-chart>
        </div>
    </v-card>
</template>

<script>
import StackBarChart from "./StackBarChart";
import _ from "lodash";
import { convertToIndianFormat } from "./helper";
export default {
    name: "DistrictView",
    components: { StackBarChart },
    data() {
        return {
            districtName: "",
            countersArr: [],
        };
    },
    props: {
        districtInfo: {
            type: Object,
            required: true,
        },
        // districtTimelineData: {
        //     type: Array,
        //     required: true,
        // },
    },
    watch: {
        districtInfo(newVal, oldVal) {
            this.initializeDistrictData();
        },
    },

    filters: {
        titleCase: function (value) {
            if (value) {
                let strs = value.split(" ");
                strs = strs.map((str) => str[0].toUpperCase() + str.slice(1));
                return strs.join(" ");
            } else {
                return value;
            }
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
            if (_.isEmpty(previousDayRecord)) {
                previousDayRecord = {
                    confirmed: 0,
                    active: 0,
                    death: 0,
                    recovered: 0,
                };
            }
            this.districtName = districtInfo.dis;
            this.countersArr = [
                {
                    label: "Confirmed",
                    key: "confirmed",
                    total: convertToIndianFormat(districtInfo.confirmed),
                    direction:
                        districtInfo.confirmed - previousDayRecord.confirmed < 0 ? "down" : "up",
                    increase: convertToIndianFormat(
                        districtInfo.confirmed - previousDayRecord.confirmed
                    ),
                },
                {
                    label: "Active",
                    key: "active",
                    total: convertToIndianFormat(districtInfo.active),
                    direction: districtInfo.active - previousDayRecord.active < 0 ? "down" : "up",
                    increase: convertToIndianFormat(districtInfo.active - previousDayRecord.active),
                },
                {
                    label: "Deceased",
                    key: "death",
                    total: convertToIndianFormat(districtInfo.deceased),
                    direction:
                        districtInfo.deceased - previousDayRecord.deceased < 0 ? "down" : "up",
                    increase: convertToIndianFormat(
                        districtInfo.deceased - previousDayRecord.deceased
                    ),
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    total: convertToIndianFormat(districtInfo.recovered),
                    direction:
                        districtInfo.recovered - previousDayRecord.recovered < 0 ? "down" : "up",
                    increase: convertToIndianFormat(
                        districtInfo.recovered - previousDayRecord.recovered
                    ),
                },
            ];
        },
    },
};
</script>
<style scoped>
.toolbar-header {
    font-size: 1.3rem;
    font-weight: 500;
    color: hsla(33, 100%, 78%, 1);
}

.ind-row-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5rem;
    font-size: 1.1rem;
}

.toolbar-timeline-container {
    height: 10rem;
}

.active-label-color {
    color: hsl(210, 100%, 50%);
}

.active-count-color {
    color: hsl(210, 100%, 65%);
}

.confirmed-label-color {
    color: hsl(0, 100%, 60%);
}

.confirmed-count-color {
    color: hsl(0, 100%, 70%);
}

.death-label-color {
    color: hsla(0, 0%, 55%, 1);
}

.death-count-color {
    color: hsla(0, 0%, 70%, 1);
}

.recovered-label-color {
    color: hsl(120, 89%, 35%);
}

.recovered-count-color {
    color: hsl(120, 89%, 45%);
}

.toolbar-count {
    /*font-weight: bold;*/
}

.font-min {
    font-size: 0.8rem;
}
</style>
