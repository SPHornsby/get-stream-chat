import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import { StreamChat } from 'stream-chat';
import Config from '../config.js'
Vue.config.productionTip = false
Vue.use(Vuex);
const client = new StreamChat(Config.GETSTREAM_KEY);

const store = new Vuex.Store({
  state: {
    client,
  },
  mutations: {
    setClient(state) {
      if (state.client) {
        return;
      }
      const newClient = new StreamChat(Config.GETSTREAM_KEY);
      state.client = newClient;
    },
  },
  actions: {
    setClient(context) {
      context.commit('setClient');
    },
  },
  getters: {
    streamClient: state => state.client
  }
})

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
