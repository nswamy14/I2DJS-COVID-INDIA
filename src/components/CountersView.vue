<template functional>
    <div class="d-flex">
        <div
            class="ind-counter pa-2 d-flex flex-column align-center justify-start subtitle-2"
        >
            <span class="red--text">CONFIRMED</span>
            <span class="red--text text--lighten-1">
                {{ props.counters && props.counters.Confirmed }}
            </span>
            <div class="sparkline-chart"></div>
        </div>

        <div
            class="ind-counter pa-2 d-flex flex-column align-center subtitle-2"
        >
            <span class="light-blue--text">ACTIVE</span>
            <span class="light-blue--text text--lighten-1">
                {{ props.counters && props.counters.Active }}
            </span>
            <div class="sparkline-chart"></div>
        </div>

        <div
            class="ind-counter pa-2 d-flex flex-column align-center subtitle-2"
        >
            <span class="green--text">RECOVERED</span>
            <span class="green--text text--lighten-1">
                {{ props.counters && props.counters.Recovered }}
            </span>
            <div class="sparkline-chart"></div>
        </div>

        <div
            class="ind-counter pa-2 d-flex flex-column align-center subtitle-2"
        >
            <span class="grey--text">DECEASED</span>
            <span class="grey--text text--lighten-1">
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
