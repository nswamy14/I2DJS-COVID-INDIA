<template>
	<div class="viz-container"></div>
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
			// console.log(range);
			this.geoHeatmapInstance.dataRange(range);
		},
		dataType(val) {
			this.geoHeatmapInstance.dataType(this.dataType);
			this.geoHeatmapInstance.update();
		},
	},

	methods: {
		initialize(covidDistData) {
			this.geoHeatmapInstance = geoHeatmap();
			this.geoHeatmapInstance.dataType(this.dataType);
      this.geoHeatmapInstance.dataRange(this.dataRange);
			this.geoHeatmapInstance.initialize(covidDistData);
		},

		update() {
			this.geoHeatmapInstance.update();
		},
	},
};
</script>
