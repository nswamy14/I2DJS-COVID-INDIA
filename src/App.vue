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
		<map-container id="map-container" class="map-container"></map-container>
		<div class="timeline-container">
			<timeline-view id="timeline-container"></timeline-view>
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

export default {
	name: 'MainView',
	components: { DistrictView, Toolbar, TimelineView, CountersView, MapContainer },
	data () {
		return {};
	}
};
</script>
<style scoped>
	.main-container {
		position: relative;
		height: 100%;
		width: 100%;
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
