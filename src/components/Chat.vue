<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faEllipsisV)

export default {
  components: {
    FontAwesomeIcon
  },
  props: {
    selectedChat: {
      type: Object,
      default: () => {}
    },
    userID: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      message: '',
      openSettings: false,
      client: this.$store.state.client,
      userToInvite: null
    }
  },
  computed: {
    mutes: function() {
      if(this.client.user && this.client.user.mutes) {
        return this.client.user.mutes.map(mute => mute.target.id);
      }
      return [];
    },
    filteredMessages: function() {
      const unmutedOnly = this.selectedChat.state.messages.filter( message => !this.mutes.includes(message.user.id))
      return unmutedOnly;
    }
  },
  methods: {
    getName: function(user) {
      return user.name ? user.name : user.id;
    },
    sendMessage: function() {
      this.selectedChat.sendMessage({ text: this.message })
    },
    messageSide: function(msg) {
      if(msg.user.id === this.userID) {
        return 'msg-right'
      }
      return 'msg-left'
    },
    smallDateTime: function(time) {
      const options = { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const date = new Date(time);
      const formattedDate = date.toLocaleDateString('en-US', options);
      return formattedDate;
    },
    senderClass: function(user) {
      if(user.id === this.userID) {
        return 'd-none'
      }
      return 'sender'
    },
    msgOwner: function(user) {
      if(user.id === this.userID) {
        return 'bg-gr'
      }
      return ''
    },
    displayMembers(membersObject) {
      const members = Object.keys(membersObject).map(i => membersObject[i]);
      return members.filter( m => m.user.id != this.userID).map( m => m.user.name).join(', ');
    },
    displayMembersIcons(membersObject) {
      const members = Object.keys(membersObject).map(i => membersObject[i]);
      return members.filter( m => m.user.id != this.userID);
    },
    membersToArray: function(membersObject) {
      return Object.keys(membersObject).map(i => membersObject[i]).filter( m => m.user.id != this.userID);
    },
    removeFromChat: function(id) {
      this.selectedChat.removeMembers([id]); 
    },
    muteUser: function(id) {
      this.$emit('mute-user', id)
    },
    unMuteUser: function(id) {
      this.$emit('unmute-user', id)
    },
    muteClass: function(id) {
      if(this.client.user && this.client.user.mutes) {
        const mutes = this.client.user.mutes.map(mute => mute.target.id);
        if (mutes.includes(id)) {
          return 'button-blue'
        }
      }
      return 'button-white'
    },
    muted: function(id) {
      if(this.client.user && this.client.user.mutes) {
      const mutes = this.client.user.mutes.map(mute => mute.target.id);
      if (mutes.includes(id)) {
        return true;
      }
      }
      return false;
    },
    inviteUser: function() {
      console.log(this.userToInvite)
      this.selectedChat.inviteMembers([this.userToInvite])
    }
  }
}
</script>
<template>
  <div
    v-if='selectedChat'
    class='wrapper'
  >
    <div v-if='openSettings'>
      <div>
        <input v-model='userToInvite'>
        <button @click='inviteUser'>Invite</button>
      </div>
      <div
        v-for='member in membersToArray(selectedChat.state.members)'
        :key='member.user.id'
      >
        {{member.user.name}}
        <button @click='removeFromChat(member.user.id)'>remove from chat</button>
        <button
          v-if='!muted(member.user.id)'
          :class='muteClass(member.user.id)' @click='muteUser(member.user.id)'>mute user
        </button>
        <button
          v-else
          :class='muteClass(member.user.id)' @click='unMuteUser(member.user.id)'>unmute user
        </button>
      </div>
    </div>
    <div class='header'>
      <div class='grow-1'>
        <img v-for='member in displayMembersIcons(selectedChat.state.members)' :key='member.id' :src='member.user.image'/>
      </div>
      <p class='text-bold text-left grow-5' v-text='displayMembers(selectedChat.state.members)' />
      <div class='button-ceneterer grow-1'>
        <button class='ellipsis' @click='openSettings = !openSettings'>
          <font-awesome-icon icon="ellipsis-v" />
        </button>
      </div>
    </div>
    <div
      v-for='msg in filteredMessages'
      :key='msg.id'
      class='chatline'
      :class='messageSide(msg)'
    >
      <p :class='senderClass(msg.user)' v-text='getName(msg.user)+":"'/>
      <div><p class='msg' :class='msgOwner(msg.user)' v-text='msg.text'/><p class='msg-time' v-text='smallDateTime(msg.updated_at)' /></div>
    </div>
    <br/>
    <div class='new-message'>
      <input v-model="message">
      <button class='send-button' @click='sendMessage' v-text='"send"'/>
    </div>
    <button class='btn-danger' @click='$emit("close-chat")'>close chat</button>
  </div>
</template>
<style scoped>
.wrapper {
  text-align: center;
  background-color: #ddd;
  margin: auto;
  padding: 0 0 10px 0;
  max-width: 60%;
}
.header {
  display: flex;
  justify-content: space-between;
  background-color: #FFF192;
  padding: 5px 0;
}
.chatline{
  margin: 6px 10px;
  
}
.sender {
  font-weight: bold;
  display: block;
  margin-bottom: 0;
}
.msg {
  color: #666;
  display: inline;
  margin-left: 2px;
  background-color: #fff;
  padding: 2px 8px;
  border-radius: 5px;
}
.msg-time {
  display: inline;
  margin-left: 3px;
}
.btn-danger {
  color: white;
  background-color: #d9534f;
}
.send-button {
  border-radius: 2px;
  background-color: goldenrod;
}
.new-message input{
  width: 75%;
}
.msg-left {
  text-align: left;
}
.msg-right {
  text-align: right;
}
.d-none {
  display: none;
}
.bg-gr {
  background-color: #FFF192;
  color: black;
}
.grow-1 {
  flex-grow: 1;
  min-width: 25%;
}
.grow-5 {
  flex-grow: 5;
}
.text-left {
  text-align: left;
}
.ellipsis {
  width:40px;
  height:40px;
  background-color:#FFF192;
  color:#000;
  border: 1px black solid;
  text-align:center;
  margin-right: 10px;
}
.button-ceneterer {
  display: flex;
  align-items: center;
  justify-content:flex-end
}
.button-blue {
  background-color: blue;
  color: white;
}
</style>