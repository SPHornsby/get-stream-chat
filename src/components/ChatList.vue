<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrash, faEyeSlash, faArchive, faUserLock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
library.add(faTrash)
library.add(faEyeSlash)
library.add(faArchive)
library.add(faUserLock)

export default {
  components: {
    FontAwesomeIcon
  },
  props: {
    channels: {
      type: Array,
      default: () => []
    },
    userID: {
      type: String,
      default: ''
    }
  },
  computed:{
    dateSortedChannels: function() {
      return this.channels.slice().sort( (a,b) => {
        return new Date(b.state.last_message_at) - new Date(a.state.last_message_at);
      }).map( channel => {
        channel.unreadcount = channel.countUnread();
        return channel;
      });
    }
  },
  methods: {
    isDistinct: function(channel) {
      if (channel && channel.id && channel.id.startsWith('!members')) {
        return true;
      }
      return false;
    },
    getDate: function(state) {
      if(state && state.last_message_at != null) {
        const options = { month: 'short', day: 'numeric' };
        const date = new Date(state.last_message_at);
        const formattedDate = date.toLocaleDateString('en-US', options);
        return formattedDate;
      }
      return '';
    },
    lastMessage(msgs) {
      if(msgs.length > 0) {
        return msgs[msgs.length - 1].text;
      }
      return "no messages yet!";
    },
    selectChat(id) {
      this.$emit('channel-selected', {id})
    },
    displayMembers(membersObject) {
      const members = Object.keys(membersObject).map(i => membersObject[i]);
      return members.filter( m => m.user.id != this.userID).map( m => m.user.name).join(', ');
    },
    displayMembersIcons(membersObject) {
      const members = Object.keys(membersObject).map(i => membersObject[i]);
      return members.filter( m => m.user.id != this.userID);
    },
    destroy: function(channel) {
      channel.delete();
    },
    hideChat: function(channel) {
      channel.hide();
    },
    unwatchChat(channel) {
      channel.unwatch();
    }
  }
}
</script>
<template>
  <div>
    <div 
      v-for='channel in dateSortedChannels'
      :key='channel.cid'
      class="chat d-flex space-between "
      @click='selectChat(channel.cid)'
    >
      <div class='grow-1'>
        <img v-for='member in displayMembersIcons(channel.state.members)' :key='member.id' :src='member.user.image'/>
      </div>
      <div class='grow-5 text-left'>
        <p v-if='isDistinct(channel)'>
          <font-awesome-icon icon="user-lock" />
        </p>
        <p class='text-bold' v-text='displayMembers(channel.state.members)' />
        <p v-text='lastMessage(channel.state.messages)' />
      </div>
      <div class='grow-1'>
        <p v-text='getDate(channel.state)' />
        <p v-if='channel.unreadcount > 0' class='text-red' v-text='channel.unreadcount' />
      </div>
      <div>
        <button @click.stop='destroy(channel)'>
          <font-awesome-icon icon="trash" />
        </button>
        <button @click.stop='hideChat(channel)'>
          <font-awesome-icon icon="archive" />
        </button>
        <button @click.stop='unwatchChat(channel)'>
          <font-awesome-icon icon="eye-slash" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .chat {
    border: 1px solid black;
    margin: 2px;
    padding: 2px;
    background-color: goldenrod;
  }
  .d-flex {
    display: flex
  }
  .space-between {
    justify-content: space-between
  }
  .text-bold {
    font-weight: bold;
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
  .text-red {
    color: white;
    background-color: red;
    width: 20px;
    border-radius: 5px;
  }
</style>