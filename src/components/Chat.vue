<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEllipsisV, faUserMinus, faVolumeMute, faVolumeUp, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add([faEllipsisV, faUserMinus, faVolumeMute, faVolumeUp, faChevronLeft])

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
      // client: this.$store.state.client,
      userToInvite: null,
      chatName: this.selectedChat.name || '',
      userToAdd: null
    }
  },
  computed: {
    client: function() {
      return this.$store.state.client
    },
    mutes: function() {
      if(this.client.user && this.client.user.mutes) {
        return this.client.user.mutes.map(mute => mute.target.id);
      }
      return [];
    },
    filteredMessages: function() {
      const unmutedOnly = this.selectedChat.state.messages.filter( message => !this.mutes.includes(message.user.id))
      return unmutedOnly;
    },
    isDistinct: function() {
      if (this.selectedChat && this.selectedChat.id && this.selectedChat.id.startsWith('!members')) {
        return true;
      }
      return false;
    },
    isInvited: function() {
      const thisUser = this.selectedChat.state.members[this.userID];
      if (thisUser.invited && (!thisUser.invite_accepted_at && !thisUser.invite_rejected_at)) {
        return true;
      }
      return false;
    }
  },
  methods: {
    getName: function(user) {
      return user.name ? user.name : user.id;
    },
    sendMessage: function() {
      if(this.message) {
        this.selectedChat.sendMessage({ text: this.message })
        this.message = null;
      }
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
      if (this.isInvited) {
        return;
      }
      console.log(this.userToInvite)
      this.selectedChat.inviteMembers([this.userToInvite]);
    },
    addUser: function() {
      if (this.isInvited) {
        return;
      }
      console.log(this.userToAdd)
      this.selectedChat.addMembers([this.userToAdd]);
    },
    changeName: function() {
      // const result = await this.selectedChat.update({
      //   set: {
      //     name: this.chatName
      //   }
      // });
      // console.log('asdasdad', result)
    },
    acceptInvite: function() {
      this.selectedChat.acceptInvite({
        message: {
          text: `${this.client.user.name} joined this channel!`
        },
      })
    },
    rejectInvite: function() {
      this.selectedChat.rejectInvite()
      this.selectedChat.removeMembers([this.client.userID])
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
      <input v-model='chatName'>
      <button @click='changeName'>Change/Set Name</button>
      <div v-if='!isDistinct'>
        <input v-model='userToInvite'>
        <button @click='inviteUser'>Invite</button>
        <hr>
        <input v-model='userToAdd'>
        <button @click='addUser'>Add</button>
      </div>
      <div
        v-for='member in membersToArray(selectedChat.state.members)'
        :key='member.user.id'
      >
        {{member.user.name}}
        <button v-if='!isDistinct' @click='removeFromChat(member.user.id)'>
          <font-awesome-icon icon="user-minus" />
        </button>
        <button
          v-if='!muted(member.user.id)'
          :class='muteClass(member.user.id)' @click='muteUser(member.user.id)'
        >
          <font-awesome-icon icon="volume-mute" />
        </button>
        <button
          v-else
          :class='muteClass(member.user.id)' @click='unMuteUser(member.user.id)'
        >
          <font-awesome-icon icon="volume-up" />
        </button>
      </div>
    </div>
    <h3 v-if='isDistinct' v-text='"distinct"'/>
    <div class='header'>
      <button class='btn-back' @click='$emit("close-chat")'>
        <font-awesome-icon icon='chevron-left' />
      </button>
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
    <div v-if='isInvited'>
      <button @click='acceptInvite'>Accept Invite</button>
      <button @click='rejectInvite'>Reject Invite</button>
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
      <input v-model="message" @keyup.enter='sendMessage'>
      <button class='send-button' @click='sendMessage' v-text='"send"'/>
    </div>
    <button class='btn-danger' @click='$emit("close-chat")'>close chat</button>
  </div>
</template>
<style scoped>
.wrapper {
  text-align: center;
  background-color: #DDD;
  margin: auto;
  padding: 0 0 10px 0;
  max-width: 100%;
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
.btn-back {
  color: black;
  background-color: #FFF192;
  border: none;
}
.send-button {
  border-radius: 2px;
  background-color: #DDD;
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