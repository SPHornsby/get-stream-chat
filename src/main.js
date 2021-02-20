import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import { StreamChat } from 'stream-chat';
import Config from '../config.js'
import router from './router'
import axios from 'axios';

Vue.config.productionTip = false
Vue.use(Vuex);
const client = new StreamChat(Config.GETSTREAM_KEY);

const store = new Vuex.Store({
  state: {
    client
  },
  mutations: {
    setClient(state) {
      if (state.client) {
        return;
      }
      const newClient = new StreamChat(Config.GETSTREAM_KEY);
      state.client = newClient;
    },
    setUser(state, data) {
      state.client.setUser(data.user, data.token)
    }
  },
  actions: {
    setClient(context) {
      context.commit('setClient');
    },
    setChats(context) {
      context.commit('setChat');
    },
    loginUser({commit}, user) {
      axios.get(`http://localhost:3100/chat-token?id=${user.id}`).then( (response) => {
        commit('setUser', {
          user,
          token: response.data
        })
      });
    }
  },
  getters: {
    streamClient: state => state.client
  }
})

new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
