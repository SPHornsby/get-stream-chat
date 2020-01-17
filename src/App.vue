<script>
// import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faPlus)

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      client: null,
      channels: [],
      pendingInvites: [],
      selectedChannel: null,
      loggedIn: false,
      userID: '',
      viewProfile: false,
      buildingNewChat: false
    }
  },
  created: function () {
    this.$store.dispatch('setClient');
    const client = this.client = this.$store.state.client //new StreamChat('mnnvqhc7wzfz');

    client.on((event) => {
      // console.log('e', event.type);
      var eventsRequiringRefresh = [
        'channel.deleted',
        'notification.added_to_channel',
        'notification.mutes_updated',
        'message.new'
      ]
      if (eventsRequiringRefresh.includes(event.type)) {
        // console.log('refreshing', event.type)
        client.queryChannels( {members: { $in: [this.userID] }}, {}, {limit: 200}).then( c => {
          this.channels = c;
        });
      }
      if(event.type === 'notification.invited') {
        // console.log('invited', event)
      }
    })
  },
  methods: {
    logout() {
      this.loggedIn = false;
      this.client.disconnect();
    },
    logIn() {
      if(this.userID.length > 0) {
        this.client.disconnect();
        this.logInUser({id: this.userID})
      }
    },
    logInUser: function(user) {
      console.log('passed in ', user)
      this.$store.dispatch('loginUser', user);
      // axios.get(`http://localhost:3100/chat-token?id=${user.id}`).then( (response) => {
      //   this.loggedIn = true;
      //   this.client.setUser(
      //     user, response.data
      //   )
      //   this.updateChannels();
      // });
    },
    updateChannels: async function() {
      await this.client.queryChannels({}, {}, {limit: 200}).then( c => {
        this.channels = c;
      });
      // const invites = this.client.queryChannels({
      //   invite: 'accepted',
      // });
      // const rejected = this.client.queryChannels({
      //   invite: 'rejected',
      // });
      this.client.queryChannels({
        invite: 'pending',
      }).then( p => this.pendingInvites = p);
      // await this.client.queryChannels({}, {}, {
      //   invite: true,
      // }).then( response => console.log('invite true', response));
      // console.log(invites, rejected, pending)
    },
    displayUser: function() {
      if (this.client && this.client.user) {
        if (this.client.user.name) {
          return this.client.user.name;
        }
        return this.client.user.id;
      }
      return 'Loading...'
    },
    openProfile: function() {
      this.viewProfile = true;
    },
    openNewChat: function() {
      this.buildingNewChat = true;
      this.$router.push('new-chat')
    },
  }
}
</script>

<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <div v-if='!loggedIn'>
      <input v-model='userID' @keyup.enter="logIn"/>
      <button class='btn-green' @click='logIn'>Login</button>
    </div>
    <div class='d-flex space-between m-b' v-else>
      <div>
        <div class='item user' v-text='displayUser()' @click='openProfile'/>
        <button class='btn-primary' @click='logout'>logout</button>
      </div>
      <button
        class='item new-chat-btn'
        @click='openNewChat'
      >
        <font-awesome-icon icon="plus" />
      </button>
    </div>
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
