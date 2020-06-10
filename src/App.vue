<template>
    <v-app class="app">
        <router-view class="app-content"></router-view>
    </v-app>
</template>

<script>
export default {
    name: "app",

    data() {
        return {};
    },

    created() {
        if (!this.isBrowserCompatible()) {
            this.$router.push({ name: "NotSupportedView" });
        }

        this.initializeTheme();
    },

    methods: {
        initializeTheme(params) {
            // More props and Custom CSS Vars will be changed here.
            if (params) {
                if (params.mode === "dark") {
                    this.$vuetify.theme.dark = true;
                }

                if (params.mode === "light") {
                    this.$vuetify.theme.dark = false;
                }
            }
        },

        isBrowserCompatible() {
            return CSS.supports("display", "flex");
        },
    },
};
</script>
<style scoped>
.app {
    height: 100%;
    width: 100%;
}

.app-content {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-flow: column nowrap;
}

.app-content:hover {
    overflow: auto;
}
</style>
