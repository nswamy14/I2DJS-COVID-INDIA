<template>
    <v-card light class="mt-2">
        <div class="toolbar-header d-flex justify-center pb-2">
            {{ districtName | titleCase }}
        </div>
        <div class="d-flex flex-column">
            <div class="ind-row-content">
                <span class="d-flex justify-end active-label-color">
                    Active:
                </span>
                <span class="active-count-color toolbar-count">
                    {{ counterObj.Active }}
                </span>
            </div>

            <div class="ind-row-content">
                <span class="d-flex justify-end confirmed-label-color">
                    Confirmed:
                </span>
                <span class="confirmed-count-color toolbar-count">
                    {{ counterObj.Confirmed }}
                </span>
            </div>

            <div class="ind-row-content">
                <span class="d-flex justify-end death-label-color">
                    Death:
                </span>
                <span class="death-count-color toolbar-count">
                    {{ counterObj.Death }}
                </span>
            </div>

            <div class="ind-row-content">
                <span class="d-flex justify-end recovered-label-color">
                    Recovered:
                </span>
                <span class="recovered-count-color toolbar-count">
                    {{ counterObj.Recovered }}
                </span>
            </div>
        </div>
        <div class="toolbar-timeline-container pt-2">
            Timeline goes here
        </div>
    </v-card>
</template>

<script>
export default {
    name: "DistrictView",
    data() {
        return {
            districtName: "",
            counterObj: {},
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
            console.log(this.districtInfo);
            let districtInfo = this.districtInfo || {};
            this.districtName = districtInfo.dis;
            this.counterObj = {
                Active: districtInfo.active,
                Confirmed: districtInfo.confirmed,
                Death: districtInfo.deceased,
                Recovered: districtInfo.recovered,
            };
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
    font-weight: bold;
}
</style>
