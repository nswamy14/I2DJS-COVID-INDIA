<template>
    <div>
        <v-content>
            <v-alert prominent light color="red lighten-2" type="error">
                <h3 class="black--text">Browser Version Not Supported</h3>
                <span class="black--text">
                    Your current browser is unable to render the dashboard.
                    Please update it or use another browser to view.</span
                >
            </v-alert>
        </v-content>
    </div>
</template>

<script>
export default {
    name: "NotSupported",
    data() {
        return {};
    },
    mounted() {
        document.title = "Not Supported";
    },
};
</script>
