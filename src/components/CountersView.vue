<template functional>
	<div class="counters-container">
		<div class="ind-counter pa-2 d-flex flex-column align-center justify-start">
			<span class="confirmed-label-color">
				Confirmed
			</span>
			<span class="confirmed-count-color">
				{{ props.counters && props.counters.Confirmed }}
			</span>
			<div class="sparkline-chart"></div>
		</div>

		<div class="ind-counter pa-2 d-flex flex-column align-center">
			<span class="active-label-color">
				Active
			</span>
			<span class="active-count-color">
				{{ props.counters && props.counters.Active }}
			</span>
			<div class="sparkline-chart"></div>
		</div>

		<div class="ind-counter pa-2 d-flex flex-column align-center">
			<span class="recovered-label-color">
				Recovered
			</span>
			<span class="recovered-count-color">
				{{ props.counters && props.counters.Recovered }}
			</span>
			<div class="sparkline-chart"></div>
		</div>

		<div class="ind-counter pa-2 d-flex flex-column align-center">
			<span class="death-label-color">
				Deceased
			</span>
			<span class="death-count-color">
				{{ props.counters && props.counters.Deceased }}
			</span>
			<div class="sparkline-chart"></div>
		</div>
	</div>
</template>

<script>
export default {
	name: "CountersView",
	data() {
		return {};
	},
};
</script>
<style scoped>
.counters-container {
	display: grid;
	grid-template-columns: repeat(auto-fit, 6rem);
	grid-gap: 1rem;
}
.ind-counter {
	background-color: hsla(0, 0%, 12%, 0.7);
	border-radius: 0.5rem;
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
</style>
