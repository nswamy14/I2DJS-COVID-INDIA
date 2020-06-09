<template>
	<div>
		<v-app-bar
			:dark="!$vuetify.theme.dark"
			:light="$vuetify.theme.dark"
			app
			color="deep-orange"
			elevate-on-scroll
		>
			<v-img
				alt="I2Djs Covid India logo"
				class="mr-4"
				contain
				max-height="50px"
				max-width="50px"
				src="~assets/img/logo.png"
			>
			</v-img>
			<v-toolbar-title class="mr-auto"
				>District Level Impact Of Covid-19 In India
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<template v-slot:extension>
				<v-autocomplete
					:items="searchItems"
					chips
					class="ml-4 search"
					clearable
					hide-details
					hide-selected
					label="Search by State or District"
					prepend-inner-icon="$mapSearch"
					solo
					v-model="search"
				>
				</v-autocomplete>
				<v-select
					:items="counters"
					:menu-props="{ offsetY: true }"
					class="ml-4 counters"
					hide-details
					item-text="label"
					item-value="key"
					label="Chips"
					return-object
					solo
					v-model="selectedCounter"
				>
				</v-select>
			</template>
		</v-app-bar>
		<v-content>
			<v-container class="fill-height" fluid>
				<div class="map-container">
					<map-container
						:covidDistrictData="covidDistrictData"
						:dataRange="dataRange"
						:dataType="dataType"
						id="map-container"
						v-if="covidDistrictData.length !== 0"
					>
					</map-container>
				</div>
				<div class="timeline-container">
					<timeline-view
						:timelineData="timelineData"
						id="timeline-container"
						v-if="timelineData.data.length !== 0"
					>
					</timeline-view>
				</div>
				<!--			<district-view class="info-window"></district-view>-->
			</v-container>
		</v-content>
		<v-footer app class="footer-content justify-center">
			<span class="subtitle-2"> Made with &#10084; in I2Djs</span>
		</v-footer>
	</div>
</template>

<script>
import TimelineView from "./TimelineView";
import MapContainer from "./MapContainer";
import { getDistrictWiseDailyData, getIndianCities } from "@/api/CovidServices";

export default {
	name: "MainView",
	components: { TimelineView, MapContainer },
	data() {
		return {
			search: "Bellary",
			searchItems: ["Bellary"],
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
		};
	},

	watch: {
		selectedCounter(val) {
			// N: Change it to key
			this.dataType = val.label;
			this.timelineData = val;
		},

		search(val) {
			this.getDistrictTimelineData(val);
		},
	},

	mounted() {
		this.selectedCounter = this.counters[0];
		this.initialize();
	},

	methods: {
		async initialize() {
			let self = this;

			let [IndianCities, covidData] = Promise.all(
				await this.getIndianCities(),
				await this.getDistrictWiseDailyData()
			);

			let activeRange = [Infinity, -Infinity];
			let dateBuckets = {};
			let distMap = [];

			for (let state in covidData.districtsDaily) {
				let stateVal = covidData.districtsDaily[state];
				for (let dis in stateVal) {
					let disVal = stateVal[dis];
					let disLow = dis.toLowerCase();
					disVal.forEach(function (dt) {
						dt.visible = false;
					});
					// console.log(disLow);
					let dd =
						IndianCities[disLow] ||
						IndianCities[state.toLowerCase()];
					//  || (IndianCities[state.toLowerCase()])
					if (IndianCities[disLow]) {
						let d = {
							name: disLow,
							active: 0,
							deceased: 0,
							confirmed: 0,
							recovered: 0,
							longitude: dd.longitude,
							latitude: dd.latitude,
						};

						distMap.push(d);
						self.heatmapDataMap[d.name] = d;

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
						});
					} else {
						if (disVal[disVal.length - 1].active > 0) {
							console.log(
								disLow,
								disVal[disVal.length - 1].active,
								state
							);
						}
					}
				}
			}

			self.formattedCovidData = self.formatData(dateBuckets);
			self.animateCovid(self.formattedCovidData);
			self.covidDistrictData = distMap;
			self.dataRange = activeRange;

			self.timelineData = self.selectedCounter;
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

		getDistrictTimelineData(dist) {
			console.log(
				this.formattedCovidData.map(function (d) {
					return d.filter(function (d) {
						return d.name === dist;
					});
				})
			);
		},

		animateCovid(covidData) {
			let self = this;
			let playIndex = 0;

			function Play() {
				if (!covidData[playIndex]) {
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
				setTimeout(Play, 200);
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
					date: dt,
					confirmed: 0,
					active: 0,
					recovered: 0,
					deceased: 0,
					distList: curr,
				};
				// let barData = curr.reduce(function (p, c) {
				// 	p.active += c.active;
				// 	p.recovered += c.recovered;
				// 	p.deceased += c.deceased;
				// 	p.confirmed += c.confirmed;
				// 	return p;
				// }, dataObj);

				confirmScale[0] = Math.min(confirmScale[0], dataObj.confirmed);
				confirmScale[1] = Math.max(confirmScale[1], dataObj.confirmed);

				// timelineData.forEach(function (d) {
				// 	d.scale[0] =  Math.min(d.scale[0], dataObj[d.key]);
				// 	d.scale[1] =  Math.max(d.scale[1], dataObj[d.key]);
				// });
				dateData.push(dataObj);
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
.counters {
	max-width: 150px;
}

.search {
	max-width: 300px;
}

.map-container {
	flex: 1 1 70%;
	height: 100%;
	width: 100%;
}

.timeline-container {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 100px;
}
</style>
