<template>
    <v-app class="app">
        <router-view></router-view>
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
    background-color: #2d3436;
    /*background-image: radial-gradient(315deg, #2d3436 0%, #000000 74%);*/
    background: radial-gradient(#2d3436, #000000);
}
</style>
