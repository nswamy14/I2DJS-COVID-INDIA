<template>
	<div class="main-container">
		<div class="header-container">
			<div class="title-section">
				<label class="title"><strong>Covid-19</strong> impact on India</label>
				<span class="sub-title">District level</span>
			</div>
			<div class="counters">
				<counters-view id="counters-container"></counters-view>
			</div>
		</div>
		<map-container id="map-container" class="map-container" :dataType="dataType" :covidDistrictData="covidDistrictData" :dataRange="dataRange" v-if="covidDistrictData.length !== 0"></map-container>
		<div class="timeline-container">
			<timeline-view id="timeline-container" :timelineData="timelineData" v-if="timelineData.data.length !== 0"></timeline-view>
		</div>
		<toolbar class="toolbar-floater"></toolbar>
		<district-view class="info-window"></district-view>
	</div>
</template>

<script>
import DistrictView from './components/DistrictView.vue';
import Toolbar from './components/Toolbar.vue';
import TimelineView from './components/TimelineView.vue';
import CountersView from './components/CountersView.vue';
import MapContainer from './components/MapContainer.vue';
import * as d3 from 'd3';

export default {
	name: 'MainView',
	components: { DistrictView, Toolbar, TimelineView, CountersView, MapContainer },
	data () {
		return {
			tilesData: [{
				label: 'Confirmed', key: 'confirmed', data: [], color: '#ff3d3d', scale: [Infinity, -Infinity]
			}, {
				label: 'Active', key: 'active', data: [], color: '#36a4ff', scale: [Infinity, -Infinity]
			}, {
				label: 'Deceased', key: 'death', data: [], color: '#dba9a9', scale: [Infinity, -Infinity]
			}, {
				label: 'Recovered', key: 'recovered', data: [], color: '#0be059', scale: [Infinity, -Infinity]
			}],
			covidDistrictData: [],
			heatmapDataMap: { },
			dataRange: [],
			timelineData: {
				data: []
			},
			formattedCovidData: [],
			dataType: 'Active'
		}
	},
	 mounted () {
	 	this.initalize();
	},

	watch: {
		data () {
			// this.initialize();
		}
	},

	methods: {
		initalize () {
			var self = this;
			var indiancities = d3.json("https://nswamy14.github.io/geoJson/indianCitiesLatLong.json");
			var covidData = d3.json("https://api.covid19india.org/districts_daily.json");
			var activeRange = [Infinity, -Infinity];
			var dateBuckets = {};
			var distMap = [];

			Promise.all([indiancities, covidData]).then(function(values) {
				var disLatLng = values[0];
				var covidData = values[1];
				var districtGeoData = values[2];
				var stateGeoData = values[3];
				var count = 0;

				for(var state in covidData.districtsDaily) {
					var state_val = covidData.districtsDaily[state]
					for(var dis in state_val) {
						var dis_val = state_val[dis];
						var disLow = dis.toLowerCase();
						dis_val.forEach(function (dt) {
							dt.visible = false;
						});
						// console.log(disLow);
						var dd = disLatLng[disLow] || disLatLng[state.toLowerCase()];
						//  || (disLatLng[state.toLowerCase()])
						if (disLatLng[disLow]) {
							var d = {
								name: disLow,
								active: 0,
								death: 0,
								confirmed: 0,
								recovered: 0,
								longitude: dd.longitude,
								latitude: dd.latitude
							};
							
							distMap.push(d);
							self.heatmapDataMap[d.name] = d;

						    dis_val.forEach(function (d) {
								if (!dateBuckets[d.date]) {
									dateBuckets[d.date] = [];
								}
								d.dis = disLow;
								dateBuckets[d.date].push(d);
								
								if (Math.sqrt(d.active) > activeRange[1]) {
									activeRange[1] = Math.sqrt(d.active);
								}
								if (Math.sqrt(d.active) <= activeRange[0] && d.active > 0) {
									activeRange[0] = Math.sqrt(d.active);
								}
							});
						} else {
							if (dis_val[dis_val.length - 1].active > 0) {
								count += 1;
								console.log(disLow, dis_val[dis_val.length - 1].active, state);
							}
						}
					}
				}

				self.formattedCovidData = self.formatData(dateBuckets);
				self.animateCovid(self.formattedCovidData);
				self.covidDistrictData = distMap;
				self.dataRange = activeRange;

				self.timelineData = self.tilesData[0];
				
			});
		},

		dataSourceChange (val) {
			this.dataType = val; // 'Deceased' Example

			self.timelineData = self.tilesData.filter(function (d) {
				return d.label === val;
			})[0]; // update with corresponding data object
		},

		getDistrictTimelineData (dist) {
			console.log(this.formattedCovidData.map(function (d) {
				return d.filter(function (d) {
					return d.name === dist;
				});
			}))
		},

		animateCovid (covidData) {
			let self = this;
			var playIndex = 0;
			function Play () {
				if (!covidData[playIndex]) {
					return;
				}
				var currData = covidData[playIndex];

				self.tilesData[0].data.push({
					value: currData.confirmed
				});

				self.tilesData[1].data.push({
					value: currData.active
				});

				self.tilesData[2].data.push({
					value: currData.death
				});

				self.tilesData[3].data.push({
					value: currData.recovered
				});

				var distList = currData.distList;
				distList.forEach(function (item) {
					if (self.heatmapDataMap[item['dis']]) {
						self.heatmapDataMap[item['dis']].active = item.active;
						self.heatmapDataMap[item['dis']].confirmed = item.confirmed;
						self.heatmapDataMap[item['dis']].deceased = item.deceased;
						self.heatmapDataMap[item['dis']].recovered = item.recovered;
					}
				});

				playIndex += 1;
				setTimeout(Play, 200);
			}

			Play();
		},

		formatData (dateBuckets) {
			var self = this;
			var dtKeys = Object.keys(dateBuckets);
			var dateData = [];
			var confirmScale = [Infinity, -Infinity];
			dtKeys.forEach(function (dt) {
				var curr = dateBuckets[dt];
				var dataObj = {
					date: dt,
					confirmed: 0,
					active: 0,
					recovered: 0,
					death: 0,
					distList: curr
				}
				var barData = curr.reduce(function (p, c) {
					p.active += c.active;
					p.recovered += c.recovered;
					p.death += c.deceased;
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

			self.tilesData.forEach(function (d) {
				d.scale =  confirmScale;
			});

			return dateData;
		}
	}
};
</script>
<style scoped>
	.main-container {
		position: relative;
		height: 100%;
		width: 100%;
		background: #151515;
		display: flex;
		flex-flow: column nowrap;
	}

	.header-container {
		border: solid;
		height: 100px;
		display: flex;
		flex-flow: row wrap;
		justify-content: space-between;
		align-items: center;
	}

	.counters {
		border: solid;
		width: 200px;
	}

	.map-container {
		flex: 1 1 auto;
	}

	.toolbar-floater {
		border: solid;
		height: 50px;
		width: 200px;
		position: absolute;
		left: 100px;
		top: 100px;
	}

	.info-window {
		border: solid;
		height: 200px;
		width: 200px;
		position: absolute;
		left: 100px;
		top: 200px;
	}

	.timeline-container {
		border: solid;
		height: 100px;
	}
</style>
