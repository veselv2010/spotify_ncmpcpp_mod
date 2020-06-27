import Vue from 'vue';
import App from './App.vue';
import VueRouter from 'vue-router';

import AuthComponent from '@/components/AuthComponent';
import AuthSuccess from '@/components/AuthSuccess';
import TrackList from '@/components/TrackList';

Vue.use(VueRouter)

Vue.config.productionTip = false;

const router = new VueRouter({
    mode: 'history',
    routes: [
        { path: '/', component: AuthComponent },
        {
            path: '/success',
            component: AuthSuccess,
            props: (route) => {
                const results = /#access_token=(.+)&token_type=(\w+)&/g
                    .exec(route.hash);

                if (results && results.length >= 1) {
                    return { token: results[1] };
                }
            },
        },
        {
            path: "/tracklist",
            component: TrackList,
        }
    ]
});

new Vue({
    render: h => h(App),
    router,
}).$mount('#app')