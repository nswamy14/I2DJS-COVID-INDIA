<template>
    <div class="main-container">
        <v-content>
            <v-container class="fill-height" fluid>
                <div class="header--floater ma-4 d-flex align-center">
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
                            <span
                                class="font-weight-bold primary--text text-uppercase"
                            >
                                {{ selectedCounter.label }}
                            </span>
                            cases
                        </div>
                    </div>
                </div>

                <div class="counters--floater ma-4">
                    <counters-view :counters="mainCounter"></counters-view>
                </div>

                <div class="info-window">
                    <div class="toolbar d-flex align-center flex-wrap">
                        <v-autocomplete
                            :items="searchItems"
                            light
                            dense
                            class="mr-2 search"
                            clearable
                            hide-details
                            hide-selected
                            label="Search by State or District"
                            prepend-inner-icon="$mapSearch"
                            :menu-props="{ light: true, nudgeBottom: 5 }"
                            solo
                            v-model="search"
                        >
                        </v-autocomplete>
                        <v-menu :close-on-click="true">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    color="teal"
                                    dark
                                    width="8rem"
                                    height="2.5rem"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <span class="body-2">{{
                                        selectedCounter.label
                                    }}</span>
                                </v-btn>
                            </template>

                            <v-list dense width="8rem" color="teal">
                                <v-list-item
                                    v-for="(item, index) in counters"
                                    :key="index"
                                    @click="selectedCounter = item"
                                >
                                    <v-list-item-title
                                        class="body-2 text-uppercase"
                                        >{{ item.label }}</v-list-item-title
                                    >
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </div>
                    <v-expand-transition>
                        <district-view
                            v-if="search"
                            :districtInfo="districtInfo"
                            :districtTimelineData="districtTimelineData"
                        >
                        </district-view>
                    </v-expand-transition>
                </div>

                <div class="map-container">
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

                <div class="timeline-container--floater px-4 d-flex align-end">
                    <v-fab-transition>
                        <v-btn
                            v-if="!animFlag"
                            key="play"
                            fab
                            @click="startTimelineAnimation"
                            color="black"
                        >
                            <v-icon color="orange" size="4rem">
                                $playCircle
                            </v-icon>
                        </v-btn>
                        <v-btn
                            v-else
                            fab
                            key="pause"
                            color="black"
                            @click="stopTimelineAnimation"
                        >
                            <v-icon color="deep-orange" size="4rem">
                                $pauseCircle
                            </v-icon>
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
        <v-footer app class="justify-center transparent">
            <span class="subtitle-2">
                Made with
                <span class="red--text text--darken-4">&#10084;</span> in
                <a
                    target="_blank"
                    href="https://github.com/I2Djs/I2Djs"
                    class=""
                    >I2Djs
                </a>
            </span>
            <span class="overline text--secondary time-container ma-2">
                Last updated on {{ formattedDate }}
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

export default {
    name: "MainView",
    components: { DistrictView, TimelineView, MapContainer, CountersView },
    data() {
        return {
            search: "",
            searchGeoLocation: {},
            searchItems: [],
            selectedCounter: {},
            counters: [
                {
                    label: "Confirmed",
                    key: "confirmed",
                    data: [],
                    color: "#ff3d3d",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Active",
                    key: "active",
                    data: [],
                    color: "#36a4ff",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Deceased",
                    key: "death",
                    data: [],
                    color: "#dba9a9",
                    scale: [Infinity, -Infinity],
                },
                {
                    label: "Recovered",
                    key: "recovered",
                    data: [],
                    color: "#0be059",
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
            districtTimelineData: [],
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
            if (val && this.heatmapDataMap[val.toLowerCase()]) {
                this.searchGeoLocation = this.heatmapDataMap[val.toLowerCase()];
                this.getDistrictTimelineData(val.toLowerCase());
            } else {
                this.searchGeoLocation = "";
            }
            // this.searchGeoLocation(val);
        },
    },

    computed: {
        mainCounter() {
            let obj = {};
            this.counters.forEach((counter) => {
                let data = counter.data || [];
                obj[counter.label] =
                    data[data.length - 1] && data[data.length - 1].value;
            });
            return obj;
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
        async initialize() {
            let self = this;

            let [IndianCities, covidData] = await Promise.all([
                this.getIndianCities(),
                this.getDistrictWiseDailyData(),
            ]);
            let activeRange = [Infinity, -Infinity];
            let dateBuckets = {};
            let distMap = [];

            let pastData = pastCovidData["districtsDaily"];
            let visitedStates = {};
            for (let state in covidData.districtsDaily) {
                visitedStates[state] = {};
                let stateVal = covidData.districtsDaily[state];
                let statePastData = pastData[state] || {};
                for (let dis in stateVal) {
                    visitedStates[state][dis] = true;
                    let pastDisVal = statePastData[dis] || [];
                    let disVal = pastDisVal.concat(stateVal[dis]);
                    let disLow = dis.toLowerCase();
                    disVal.forEach(function (dt) {
                        dt.visible = false;
                    });

                    let dd =
                        IndianCities[disLow] ||
                        IndianCities[state.toLowerCase()];

                    if (IndianCities[disLow]) {
                        let districtObj = {
                            name: disLow,
                            state: state,
                            active: 0,
                            deceased: 0,
                            confirmed: 0,
                            recovered: 0,
                            longitude: dd.longitude,
                            latitude: dd.latitude,
                        };

                        disVal.forEach(function (d) {
                            if (!dateBuckets[d.date]) {
                                dateBuckets[d.date] = [];
                            }
                            d.dis = disLow;
                            dateBuckets[d.date].push(d);

                            if (Math.sqrt(d.active) > activeRange[1]) {
                                activeRange[1] = Math.sqrt(d.active);
                            }
                            if (
                                Math.sqrt(d.active) <= activeRange[0] &&
                                d.active > 0
                            ) {
                                activeRange[0] = Math.sqrt(d.active);
                            }

                            districtObj.confirmed = d.confirmed;
                            districtObj.active = d.active;
                            districtObj.deceased = d.deceased;
                            districtObj.recovered = d.recovered;
                        });

                        distMap.push(districtObj);
                        self.heatmapDataMap[districtObj.name] = districtObj;
                    } else {
                        if (disVal[disVal.length - 1].active > 0) {
                            // count += 1;
                            // console.log(
                            // 	disLow,
                            // 	disVal[disVal.length - 1].active,
                            // 	state
                            // );
                        }
                    }
                }
            }

            self.formattedCovidData = self.formatData(dateBuckets);
            // console.log(self.formattedCovidData);
            // self.animateCovid(self.formattedCovidData);
            self.covidDistrictData = distMap;
            self.dataRange = activeRange;
            self.searchItems = Object.keys(self.heatmapDataMap);
            // console.log(JSON.stringify(tempDistMap));
            self.updateCounters();
            self.timelineData = self.selectedCounter;
            console.log(self.timelineData);
        },

        // searchGeoLocation (geoLocation) {
        // 	this.getDistrictTimelineData(val);
        // },

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

        getDistrictTimelineData(dist) {
            let data = this.formattedCovidData.map((date) => {
                return date["distList"].filter((distObj) => {
                    return distObj["dis"] === dist;
                });
            });
            data = data.filter((d) => d.length !== 0);
            if (data.length !== 0) {
                this.districtInfo =
                    data[data.length - 1] && data[data.length - 1][0];
                this.districtTimelineData = data;
            } else {
                this.districtInfo = {
                    dis: dist,
                };
                this.districtTimelineData = [];
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
                    value: d.deceased,
                });
                self.counters[3].data.push({
                    value: d.recovered,
                });
            });
        },

        clearCounters() {
            this.counters[0].data = [];
            this.counters[1].data = [];
            this.counters[2].data = [];
            this.counters[3].data = [];
        },

        startTimelineAnimation() {
            this.animFlag = true;
            this.clearCounters();
            this.animateCovid(this.formattedCovidData);
        },

        stopTimelineAnimation() {
            let self = this;
            self.animFlag = false;
            self.updateTimelineData();
        },
        animateCovid(covidData) {
            let self = this;
            let playIndex = 0;

            function Play() {
                if (!self.animFlag) {
                    return;
                }
                if (!covidData[playIndex]) {
                    console.log(self.heatmapDataMap["mumbai"]);
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
                    value: currData.deceased,
                });

                self.counters[3].data.push({
                    value: currData.recovered,
                });

                let distList = currData.distList;
                distList.forEach(function (item) {
                    if (self.heatmapDataMap[item["dis"]]) {
                        self.heatmapDataMap[item["dis"]].active = item.active;
                        self.heatmapDataMap[item["dis"]].confirmed =
                            item.confirmed;
                        self.heatmapDataMap[item["dis"]].deceased =
                            item.deceased;
                        self.heatmapDataMap[item["dis"]].recovered =
                            item.recovered;
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
            dtKeys.forEach(function (dt) {
                let curr = dateBuckets[dt];
                let dataObj = {
                    date: new Date(dt),
                    confirmed: 0,
                    active: 0,
                    recovered: 0,
                    deceased: 0,
                    distList: curr,
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

                // timelineData.forEach(function (d) {
                // 	d.scale[0] =  Math.min(d.scale[0], dataObj[d.key]);
                // 	d.scale[1] =  Math.max(d.scale[1], dataObj[d.key]);
                // });
                dateData.push(dataObj);
            });

            dateData = dateData.sort(function (a, b) {
                return a.date - b.date;
            });

            self.counters.forEach(function (d) {
                d.scale = confirmScale;
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
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
}

.main-container:hover {
    overflow: auto;
}

.header--floater {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;
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
    top: 15vh;
}

.search {
    max-width: 18rem;
}

.map-container {
    height: 100%;
    width: 100%;
}

.timeline-container--floater {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 5rem;
}

.time-container {
    position: absolute;
    right: 0;
    top: 0;
}
</style>
