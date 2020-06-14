import Vue from "vue";
import CustomPopover from "@/components/CustomPopover";

import vuetify from "@/plugins/vuetify";

import App from "@/App";
import router from "@/router";

// Global CSS
import "@/assets/css/main.css";

Vue.config.productionTip = false;

new Vue({
    router,
    vuetify,
    render: (h) => h(App),
}).$mount("#app");

Vue.component(CustomPopover.name, CustomPopover);
