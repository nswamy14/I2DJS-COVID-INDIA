<template>
	<div class="toolbar-container px-4 py-2">
		<div class="toolbar-header d-flex justify-center pb-2">
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
                        <v-icon size="1rem" :class="[counter.key + '-count-color', 'ml-n1']">
                            $arrowUp
                        </v-icon>
                        <span class="ml-n1 font-min">
                            {{ counter.increase || 0 }}
                        </span>
                    </template>
                </div>
            </div>
		</div>
		<div class="toolbar-timeline-container pt-2">
			Timeline goes here
		</div>
	</div>
</template>

<script>
import _ from "lodash";
import { convertToIndianFormat } from "./helper";
export default {
	name: "DistrictView",
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
		districtTimelineData: {
			type: Array,
			required: true,
		},
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
			let districtInfo = this.districtInfo || {};
			let length = this.districtTimelineData.length;
			let previousDayRecord = (this.districtTimelineData[length - 2] &&
                    this.districtTimelineData[length - 2][0]) || {};
			if (_.isEmpty(previousDayRecord)) {
                previousDayRecord = {
                    'confirmed': 0,
                    'active': 0,
                    'death': 0,
                    'recovered': 0
                };
            }
			this.districtName = districtInfo.dis;
			this.countersArr = [{
                'label': 'Confirmed',
                'key': 'confirmed',
                'total': convertToIndianFormat(districtInfo.confirmed),
                'increase': convertToIndianFormat(districtInfo.confirmed - previousDayRecord.confirmed)
            }, {
			    'label': 'Active',
                'key': 'active',
                'total': convertToIndianFormat(districtInfo.active),
                'increase': convertToIndianFormat(districtInfo.active - previousDayRecord.active)
            }, {
                'label': 'Deceased',
                'key': 'death',
                'total': convertToIndianFormat(districtInfo.deceased),
                'increase': convertToIndianFormat(districtInfo.deceased - previousDayRecord.deceased)
            }, {
			    'label': 'Recovered',
                'key': 'recovered',
                'total': convertToIndianFormat(districtInfo.recovered),
                'increase': convertToIndianFormat(districtInfo.recovered - previousDayRecord.recovered)
            }];
		},
	},
};
</script>
<style scoped>
.toolbar-container {
	border-radius: 1rem;
}

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
