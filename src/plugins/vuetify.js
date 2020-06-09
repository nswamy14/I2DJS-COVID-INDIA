import Vue from "vue";
import Vuetify from "vuetify/lib";
import materializeIcons from "@/plugins/materialDesignIcons";
import { preset } from "vue-cli-plugin-vuetify-preset-responsive/preset";

Vue.use(Vuetify);

export default new Vuetify({
	preset,
	icons: {
		iconfont: "mdiSvg",
		values: materializeIcons,
	},
	theme: {
		dark: true,
	},
});
