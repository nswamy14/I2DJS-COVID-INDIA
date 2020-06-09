<template>
	<div class="viz-container"></div>
</template>

<script>
import timelineBarChart from "./../libs/timelineBarChart.js";
export default {
	name: "TimelineView",
	data() {
		return {};
	},
	props: {
		timelineData: {
			type: Object,
			required: true,
		},
	},
	mounted() {
		this.initialize(this.timelineData);
	},
	watch: {
		timelineData: {
			handler(val) {
				this.update();
			},
			deep: true,
		},
	},
	methods: {
		initialize(data) {
			console.log(this.timelineData);
			this.timelineInstance = timelineBarChart();
			this.timelineInstance.dataRange(this.timelineData.scale);
			this.timelineInstance.initialize(this.timelineData.data);
		},

		update() {
			this.timelineInstance.update(this.timelineData.data);
		},
	},
};
</script>
