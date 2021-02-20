<template>
  <div id="app">
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
      <button @click='getInvites'>Get Invites</button>
    </div>
    <Profile
      v-if='viewProfile'
      @close-profile='viewProfile = false'
    />
    <ChatMenu
      v-if='loggedIn && !viewProfile'
      :channels='channels'
      :selectedChannel='selectedChannel'
      :buildingNewChat='buildingNewChat'
      @close-new-chat='buildingNewChat = false'
      @new-channel='addChannel'
      @channel-selected='selectChannel'
      @close-channel='selectedChannel=null'
      @update-channels='updateChannels'
    />
  </div>
</template>

<script>
import ChatMenu from './components/ChatMenu.vue'
import Profile from './components/Profile.vue'
// import { StreamChat } from 'stream-chat';
import axios from 'axios';
import uuidv1 from 'uuid/v1';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faPlus)
// import fakeUsers from './fake-users.js';
// const testUser = {
//   id: 'sean'
// }

export default {
  name: 'app',
  components: {
    ChatMenu,
    FontAwesomeIcon,
    Profile
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
    getInvites: function() {
      this.client.queryChannels({invite: 'pending'}).then(p => {
        // console.log('p', p)
        this.pendingInvites = p;
      })
    },
    openProfile: function() {
      this.viewProfile = true;
    },
    openNewChat: function() {
      this.buildingNewChat = true;
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
    selectChannel(data) {
      this.client.queryChannels({cid: data.id}).then(channel => {
        this.selectedChannel = channel[0];
      });
    },
    logInUser: function(user) {
      axios.get(`http://localhost:3100/chat-token?id=${user.id}`).then( (response) => {
        this.loggedIn = true;
        this.client.setUser(
          user, response.data
        )
        this.updateChannels();
      });
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
    addChannel: async function(channelData) {
      const members = channelData.channel.members.map(m => m.user_id);
      // look for identical chat
      const identicalChat = await this.client.queryChannels({members}, {}, {limit: 1000});
      if (identicalChat.length > 0) {
        this.selectChannel({id: identicalChat[0].cid});
      } else {
        // console.log('no chat found')
        const id = members.length > 2 ? uuidv1() : null;
        const conversation = this.client.channel('ethika-messaging', id, {
            members
        });
        conversation.create();
        this.selectedChannel = conversation
      }
    }
  }
}
</script>
<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

}
.btn-green {
  background-color: #5cb85c;
  color: black;
}
.btn-primary {
  background-color: #0275d8;
  color: white;
}
.user {
  font-size: 1.5em;
  font-weight: bold;
  color: gold;
}
.new-chat-btn {
  width:60px;
  height:60px;
  background-color:#0C9;
  color:#FFF;
  border-radius:50px;
  text-align:center;
  box-shadow: 2px 2px 3px #999;
}
.d-flex {
  display: flex
}
.space-between {
  justify-content: space-between
}
.m-b {
  margin-bottom: 10px;
}
</style>
