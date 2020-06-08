import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import materializeIcons from '@/plugins/materialDesignIcons';

Vue.use(Vuetify);

export default new Vuetify({
	icons: {
		iconfont: 'mdiSvg',
		values: materializeIcons
	}
});
