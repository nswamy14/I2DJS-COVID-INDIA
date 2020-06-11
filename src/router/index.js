import Vue from "vue";
import VueRouter from "vue-router";

const MainView = () => import(/* webpackChunkName: "main-views-group" */ "@/components/MainView");
const NotSupportedView = () =>
    import(/* webpackChunkName: "main-views-group" */ "@/components/NotSupportedView");

Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "MainView",
        component: MainView,
    },
    {
        path: "/not-supported",
        name: "NotSupportedView",
        component: NotSupportedView,
    },
    { path: "*", redirect: "/" },
];

const router = new VueRouter({
    routes,
});

export default router;
