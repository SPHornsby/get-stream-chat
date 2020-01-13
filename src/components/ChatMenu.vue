<script>
import ChatList from './ChatList.vue'
import Chat from './Chat.vue'
import Search from './Search.vue'

export default {
  props: {
    channels: {
      type: Array,
      default: () => []
    },
    sChannel: {
      type: Object,
      default: () => {}
    },
    buildingNewChat: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ChatList,
    Chat,
    Search
  },
  data() {
    return {
      selectedChat: null,
      client: this.$store.state.client
    }
  },
  methods: {
    handleNewChannelEmit: function(data) {
      this.$emit('new-channel', data);
    },
    selectChannel: function(data) {
      this.$emit('channel-selected', data)
      this.selectedChat = data.id;
    },
    muteUser: function(id) {
      this.client.muteUser(id)
    },
    unmuteUser: function(id) {
      this.client.unmuteUser(id)
    }
  }
}
</script>
<template>
  <div class='makeItSmaller'>
    <div v-if='!buildingNewChat'>
      <ChatList
        v-if='!sChannel'
        :channels='channels'
        :userID='client.userID'
        @channel-selected='selectChannel'
      />
      <Chat
        v-if='sChannel'
        :selectedChat='sChannel'
        :client='client'
        :userID='this.client.userID'
        @close-chat='$emit("close-channel")'
        @mute-user='muteUser'
        @unmute-user='unmuteUser'
      />
    </div>
    <Search
      v-else
      :client='client'
      @close='$emit("close-new-chat")'
      @new-channel='handleNewChannelEmit'
    />
  </div>
</template>
<style scoped>
  .topline {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
  .user {
    font-size: 1.5em;
    font-weight: bold;
    color: gold;
  }
  .makeItSmaller {
    margin: auto;
    max-width: 80%;
  }

</style>