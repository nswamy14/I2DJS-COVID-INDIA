<template>
    <div class="main-container">
        <v-progress-linear :active="showProgress" indeterminate color="orange"> </v-progress-linear>
        <v-content>
            <v-container class="fill-height align-content-start" fluid>
                <div
                    :class="[
                        $vuetify.breakpoint.smAndDown
                            ? 'flex-fill  my-2 align-self-start px-2'
                            : 'header--floater header-title ma-4',
                    ]"
                    class="d-flex align-center"
                >
                    <v-img
                        alt="I2Djs Covid India logo"
                        class="mr-4"
                        contain
                        max-height="4rem"
                        max-width="4rem"
                        src="~assets/img/logo.png"
                    >
                    </v-img>
                    <div class="d-flex flex-column">
                        <div class="title"><strong>COVID-19</strong> INDIA</div>
                        <div class="subtitle-2 text--secondary">
                            Showing district level data of
                            <span class="font-weight-bold primary--text text-uppercase">
                                {{ selectedCounter.label }}
                            </span>
                            cases
                        </div>
                    </div>
                </div>

                <counters-view
                    :class="[
                        $vuetify.breakpoint.smAndDown
                            ? 'flex-fill px-4 mt-2'
                            : 'counters--floater ma-4',
                    ]"
                    :counters="mainCounter"
                    v-if="mainCounter"
                ></counters-view>

                <div :class="[[this.$vuetify.breakpoint.name]]" class="info-window">
                    <div class="toolbar d-flex align-center flex-wrap justify-center mt-2">
                        <v-autocomplete
                            :items="searchItems"
                            item-text="label"
                            :menu-props="{
                                light: true,
                                nudgeBottom: 5,
                                contentClass: 'text-capitalize',
                            }"
                            class="mr-2 search"
                            clearable
                            dense
                            hide-details
                            hide-selected
                            label="Search by State or District"
                            light
                            prepend-inner-icon="$mapSearch"
                            solo
                            return-object
                            v-model="search"
                            :filter="districtSearch"
                        >
                        </v-autocomplete>
                        <v-menu :close-on-click="true">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    color="text-secondary"
                                    height="2.5rem"
                                    light
                                    v-bind="attrs"
                                    v-on="on"
                                    width="7.5rem"
                                >
                                    <span :class="selectedCounter.key" class="color mr-1"></span>
                                    <span class="caption">{{ selectedCounter.label }}</span>
                                </v-btn>
                            </template>

                            <v-list color="text-secondary" dense light width="7.5rem">
                                <v-list-item
                                    :key="index"
                                    @click="selectedCounter = item"
                                    class="px-2"
                                    v-for="(item, index) in counters"
                                >
                                    <span :class="item.key" class="color mr-1"></span>
                                    <span class="caption text-uppercase">{{ item.label }}</span>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <v-expand-transition>
                        <district-view :districtInfo="districtInfo" v-if="search"></district-view>
                    </v-expand-transition>
                </div>

                <div :class="['map-container', [this.$vuetify.breakpoint.name]]">
                    <map-container
                        :covidDistrictData="covidDistrictData"
                        :dataRange="dataRange"
                        :dataType="dataType"
                        :searchGeoLocation="searchGeoLocation"
                        id="map-container"
                        v-if="covidDistrictData.length !== 0"
                    >
                    </map-container>
                </div>

                <div
                    :class="[{ floater: $vuetify.breakpoint.smAndUp }]"
                    class="mx-4 d-flex align-end timeline-container"
                >
                    <v-fab-transition>
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="startTimelineAnimation"
                            color="orange"
                            fab
                            key="play"
                            light
                            v-if="!animFlag"
                        >
                            <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$play</v-icon>
                        </v-btn>
                        <v-btn
                            :small="$vuetify.breakpoint.md"
                            :x-small="$vuetify.breakpoint.smAndDown"
                            @click="stopTimelineAnimation"
                            color="deep-orange"
                            fab
                            key="pause"
                            light
                            v-else
                        >
                            <v-icon :x-large="$vuetify.breakpoint.lgAndUp">$stop</v-icon>
                        </v-btn>
                    </v-fab-transition>
                    <timeline-view
                        :timelineData="timelineData"
                        id="timeline-container"
                        v-if="timelineData.data.length !== 0"
                    >
                    </timeline-view>
                </div>
            </v-container>
        </v-content>
        <v-footer app class="flex-wrap justify-center transparent">
            <div
                :class="[$vuetify.breakpoint.xs ? 'flex-fill' : 'update-time-floater ma-2']"
                class="overline text--secondary"
            >
                Last updated on <span class="text--primary">{{ formattedDate }}</span>
            </div>
            <span class="subtitle-2">
                Made with
                <span class="red--text text--darken-4">&#10084;</span> in
                <a class="" href="https://github.com/I2Djs/I2Djs" target="_blank">I2Djs </a>
            </span>
        </v-footer>
    </div>
</template>

<script>
import TimelineView from "./TimelineView";
import MapContainer from "./MapContainer";
import DistrictView from "./DistrictView";
import CountersView from "./CountersView";
import pastCovidData from "@/assets/data/pastCovidData";
import { getDistrictWiseDailyData, getIndianCities } from "@/api/CovidServices";
import { convertToIndianFormat, getFormattedSelectItems } from "./helper";

export default {
    name: "MainView",
    components: { DistrictView, TimelineView, MapContainer, CountersView },
    data() {
        return {
            showProgress: false,
            search: "",
            searchGeoLocation: {},
            searchItems: [],
            selectedCounter: {},
            counters: [
                {
                    label: "Confirmed",
                    key: "confirmed",
                    data: [],
                    color: "red",
                    colorHex: "#F44336",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Active",
                    key: "active",
                    data: [],
                    color: "light-blue",
                    colorHex: "#29b6f6",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    data: [],
                    color: "green",
                    colorHex: "#4CAF50",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Deceased",
                    key: "deceased",
                    data: [],
                    color: "grey",
                    colorHex: "#9E9E9E",
                    scale: [Infinity, -Infinity],
                },
            ],
            covidDistrictData: [],
            heatmapDataMap: {},
            dataRange: [],
            timelineData: {
                data: [],
            },
            formattedCovidData: [],
            dataType: "Active",
            animFlag: false,
            districtInfo: {},
            // districtTimelineData: [],
            lastUpdatedTime: new Date(),
        };
    },

    watch: {
        selectedCounter(val) {
            // N: Change it to key
            this.dataType = val.label;
            this.timelineData = val;
        },

        search(val) {
            console.log(val);
            if (val && val.type === "District" && this.heatmapDataMap[val.label.toLowerCase()]) {
                this.searchGeoLocation = this.heatmapDataMap[val.label.toLowerCase()];
                this.getDistrictTimelineData(val.label.toLowerCase());
            } else if (
                val &&
                val.type === "State" &&
                this.formattedCovidStateData[val.label.toLowerCase()]
            ) {
                this.searchGeoLocation = this.formattedCovidStateData[val.label.toLowerCase()];
                this.getStateTimelineData(val.label.toLowerCase());
            } else {
                this.searchGeoLocation = {};
            }
            // if (val && this.heatmapDataMap[val.toLowerCase()]) {
            //     this.searchGeoLocation = this.heatmapDataMap[val.toLowerCase()];
            //     this.getStateTimelineData(val.toLowerCase());
            // } else {

            // }
        },
    },

    computed: {
        mainCounter() {
            let countersArr = [];
            this.counters.forEach((counter) => {
                let data = counter.data || [];
                let total = (data[data.length - 1] && data[data.length - 1].value) || 0;
                let previousDayCount = (data[data.length - 2] && data[data.length - 2].value) || 0;
                let increaseCount = total - previousDayCount;
                countersArr.push({
                    color: counter.color,
                    colorHex: counter.colorHex,
                    label: counter.label,
                    key: counter.key,
                    total: convertToIndianFormat(total),
                    direction: increaseCount < 0 ? "down" : "up",
                    increaseCount: convertToIndianFormat(Math.abs(increaseCount)),
                    data: data,
                    scale: counter.scale,
                });
            });
            return countersArr;
        },

        formattedDate() {
            if (this.lastUpdatedTime) {
                return `${this.lastUpdatedTime.getDate()}-${
                    this.lastUpdatedTime.getMonth() + 1
                }-${this.lastUpdatedTime.getFullYear()}`;
            } else {
                return "";
            }
        },
    },
    mounted() {
        this.selectedCounter = this.counters[1];
        this.initialize();
    },

    methods: {
        districtSearch(item, queryText, itemText) {
            let queryTextUpperCase = queryText.toUpperCase();
            return item.label && item.label.toUpperCase().indexOf(queryTextUpperCase) !== -1;
        },

        async initialize() {
            let self = this;

            self.showProgress = true;

            let [IndianCities, covidData] = await Promise.all([
                this.getIndianCities(),
                this.getDistrictWiseDailyData(),
            ]);
            let activeRange = [Infinity, -Infinity];
            let dateBuckets = {};

            let distMap = [];
            let stateMap = {};
            let count = 0;

            let pastData = pastCovidData["districtsDaily"];
            // let visitedStates = {};
            for (let state in covidData.districtsDaily) {
                // visitedStates[state] = {};
                let stateVal = covidData.districtsDaily[state];
                let statePastData = pastData[state] || {};
                let stateLow = state.toLowerCase();

                let stateDd = IndianCities[stateLow] || {};
                let stateObj = {
                    name: stateLow,
                    label:
                        stateLow.charAt(0).toUpperCase() + stateLow.substr(1, stateLow.length - 1),
                    state: state,
                    active: 0,
                    deceased: 0,
                    confirmed: 0,
                    recovered: 0,
                    longitude: stateDd.longitude,
                    latitude: stateDd.latitude,
                    timelineData: {},
                    type: "state",
                };

                for (let dis in stateVal) {
                    // visitedStates[state][dis] = true;
                    let pastDisVal = statePastData[dis] || [];
                    let disVal = pastDisVal.concat(stateVal[dis]);
                    let disLow = dis.toLowerCase();

                    disVal.forEach(function (dt) {
                        dt.visible = false;
                    });

                    let dd = IndianCities[disLow];

                    if (dd && !self.heatmapDataMap[disLow]) {
                        let districtObj = {
                            name: disLow,
                            label:
                                disLow.charAt(0).toUpperCase() +
                                disLow.substr(1, disLow.length - 1),
                            state: state,
                            active: 0,
                            deceased: 0,
                            confirmed: 0,
                            recovered: 0,
                            longitude: dd.longitude,
                            latitude: dd.latitude,
                            type: "district",
                        };

                        disVal.forEach(function (d) {
                            if (!dateBuckets[d.date]) {
                                dateBuckets[d.date] = [];
                            }
                            if (!stateObj.timelineData[d.date]) {
                                stateObj.timelineData[d.date] = {
                                    confirmed: 0,
                                    active: 0,
                                    deceased: 0,
                                    recovered: 0,
                                    date: new Date(d.date),
                                };
                            }

                            stateObj.timelineData[d.date].confirmed += d.confirmed;
                            stateObj.timelineData[d.date].active += d.active;
                            stateObj.timelineData[d.date].deceased += d.deceased;
                            stateObj.timelineData[d.date].recovered += d.recovered;

                            d.dis = disLow;
                            dateBuckets[d.date].push(d);

                            if (Math.sqrt(d.active) > activeRange[1]) {
                                activeRange[1] = Math.sqrt(d.active);
                            }
                            if (Math.sqrt(d.active) <= activeRange[0] && d.active > 0) {
                                activeRange[0] = Math.sqrt(d.active);
                            }
                        });
                        stateObj.confirmed += disVal[disVal.length - 1].confirmed;
                        stateObj.active += disVal[disVal.length - 1].active;
                        stateObj.deceased += disVal[disVal.length - 1].deceased;
                        stateObj.recovered += disVal[disVal.length - 1].recovered;
                        distMap.push(districtObj);
                        self.heatmapDataMap[districtObj.name] = districtObj;
                    }
                }
                stateMap[stateObj.name] = stateObj;
            }
            // console.log(stateMap);
            self.formattedCovidStateData = stateMap;
            self.formattedCovidData = self.formatData(dateBuckets);
            self.covidDistrictData = distMap;
            self.dataRange = activeRange;
            let searchItems = [];
            let states = [];
            _.forEach(self.heatmapDataMap, (value, district) => {
                searchItems.push({
                    label: district,
                    type: "District",
                });
                if (states.indexOf(value.state) === -1) {
                    states.push(value.state);
                }
            });
            states = _.map(states, (state) => {
                return {
                    label: state,
                    type: "State",
                };
            });
            searchItems = searchItems.concat(states);
            self.searchItems = getFormattedSelectItems(searchItems, "type");
            self.updateCounters();
            self.updateHeatmapData();
            self.timelineData = self.selectedCounter;
            await self.$nextTick();
            await self.$nextTick();
            self.showProgress = false;
        },

        async getDistrictWiseDailyData() {
            try {
                let response = await getDistrictWiseDailyData();
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        async getIndianCities() {
            try {
                let response = await getIndianCities();
                return response;
            } catch (e) {
                console.error(e);
            }
        },

        getStateTimelineData(state) {
            let stateObj = this.formattedCovidStateData[state];
            let dateArr = [];
            for (let key in stateObj.timelineData) {
                dateArr.push(stateObj.timelineData[key]);
            }
            dateArr = dateArr.sort(function (a, b) {
                return a.date - b.date;
            });

            this.districtInfo = {
                name: stateObj.name,
                label: stateObj.label,
                confirmed: stateObj.confirmed,
                active: stateObj.active,
                deceased: stateObj.deceased,
                recovered: stateObj.recovered,
                data: dateArr.length > 45 ? dateArr.splice(dateArr.length - 45, 45) : dateArr,
            };
            console.log(this.districtInfo);
        },

        getDistrictTimelineData(dist) {
            let data = this.formattedCovidData.map((date) => {
                return date["distList"].filter((distObj) => {
                    return distObj["dis"] === dist;
                });
            });
            data = data.filter((d) => d.length !== 0);
            data = data.map(function (d) {
                return d[0];
            });
            if (data.length !== 0) {
                let obj = data[data.length - 1];
                this.districtInfo = {
                    name: obj.dis,
                    confirmed: obj.confirmed,
                    active: obj.active,
                    deceased: obj.deceased,
                    recovered: obj.recovered,
                    data: data.length > 45 ? data.splice(data.length - 45, 45) : data,
                };
            } else {
                this.districtInfo = {
                    name: dist,
                    data: [],
                };
            }
        },

        updateCounters() {
            let self = this;
            self.clearCounters();
            self.formattedCovidData.forEach(function (d) {
                self.counters[0].data.push({
                    value: d.confirmed,
                });
                self.counters[1].data.push({
                    value: d.active,
                });
                self.counters[2].data.push({
                    value: d.recovered,
                });
                self.counters[3].data.push({
                    value: d.deceased,
                });
            });
        },

        updateHeatmapData() {
            let self = this;
            let d = this.formattedCovidData[this.formattedCovidData.length - 1];
            let distData = d.distList;
            for (var i = 0; i < distData.length; i++) {
                let item = distData[i];
                if (self.heatmapDataMap[item["dis"]]) {
                    self.heatmapDataMap[item["dis"]].active = item.active;
                    self.heatmapDataMap[item["dis"]].confirmed = item.confirmed;
                    self.heatmapDataMap[item["dis"]].deceased = item.deceased;
                    self.heatmapDataMap[item["dis"]].recovered = item.recovered;
                }
            }
        },

        clearCounters() {
            this.counters[0].data = [];
            this.counters[1].data = [];
            this.counters[2].data = [];
            this.counters[3].data = [];
        },

        clearHeatMapData() {
            for (let key in this.heatmapDataMap) {
                this.heatmapDataMap[key].confirmed = 0;
                this.heatmapDataMap[key].active = 0;
                this.heatmapDataMap[key].deceased = 0;
                this.heatmapDataMap[key].recovered = 0;
            }
        },

        startTimelineAnimation() {
            this.animFlag = true;
            this.clearCounters();
            this.clearHeatMapData();
            this.animateCovid(this.formattedCovidData);
        },

        stopTimelineAnimation() {
            let self = this;
            self.animFlag = false;
            self.updateCounters();
            self.updateHeatmapData();
        },

        resetTimelineData() {},

        animateCovid(covidData) {
            let self = this;
            let playIndex = 0;

            function Play() {
                if (!self.animFlag) {
                    return;
                }
                if (!covidData[playIndex]) {
                    self.animFlag = false;
                    return;
                }
                let currData = covidData[playIndex];

                self.counters[0].data.push({
                    value: currData.confirmed,
                });

                self.counters[1].data.push({
                    value: currData.active,
                });

                self.counters[2].data.push({
                    value: currData.recovered,
                });

                self.counters[3].data.push({
                    value: currData.deceased,
                });

                let distList = currData.distList;
                distList.forEach(function (item) {
                    if (self.heatmapDataMap[item["dis"]]) {
                        self.heatmapDataMap[item["dis"]].active = item.active;
                        self.heatmapDataMap[item["dis"]].confirmed = item.confirmed;
                        self.heatmapDataMap[item["dis"]].deceased = item.deceased;
                        self.heatmapDataMap[item["dis"]].recovered = item.recovered;
                    }
                });

                playIndex += 1;
                setTimeout(Play, 100);
            }

            Play();
        },

        formatData(dateBuckets) {
            let self = this;
            let dtKeys = Object.keys(dateBuckets);
            let dateData = [];
            let confirmScale = [Infinity, -Infinity];
            let totalDateItems = 0;
            dtKeys.forEach(function (dt) {
                let curr = dateBuckets[dt];
                let dataObj = {
                    date: new Date(dt),
                    confirmed: 0,
                    active: 0,
                    recovered: 0,
                    deceased: 0,
                    distList: curr,
                    type: "district",
                };
                curr.reduce(function (p, c) {
                    p.active += c.active;
                    p.recovered += c.recovered;
                    p.deceased += c.deceased;
                    p.confirmed += c.confirmed;
                    return p;
                }, dataObj);

                confirmScale[0] = Math.min(confirmScale[0], dataObj.confirmed);
                confirmScale[1] = Math.max(confirmScale[1], dataObj.confirmed);

                dateData.push(dataObj);
                totalDateItems += 1;
            });

            dateData = dateData.sort(function (a, b) {
                return a.date - b.date;
            });

            self.counters.forEach(function (d) {
                d.scale = confirmScale;
                d.dateCount = totalDateItems;
            });

            return dateData;
        },
    },
};
</script>
<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    flex-flow: column nowrap;
}

.header--floater {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
}

.header-title {
    width: 30vw;
}

.counters--floater {
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
}

.info-window {
    position: absolute;
    z-index: 1;
    top: 8rem;
}

.info-window.xs {
    top: 13rem;
    left: calc(50% - 12rem);
}

.search {
    max-width: 17rem;
}

.map-container {
    height: 100%;
    width: 100%;
}

.map-container.sm {
    margin-top: 5rem;
    height: calc(100% - 20rem);
}
.map-container.xs {
    margin-top: 5rem;
    height: 100vmin;
}

.timeline-container {
    width: calc(100% - 2rem);
    height: 4rem;
}

.timeline-container.floater {
    position: absolute;
    bottom: 0;
}

.update-time-floater {
    position: absolute;
    right: 0;
    top: 0;
}
</style>
