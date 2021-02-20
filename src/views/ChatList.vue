<script>
import ChatList from '../components/ChatList.vue'

export default {
  props: {
    channels: {
      type: Array,
      default: () => []
    },
    requests: {
      type: Array,
      default: () => []
    },
  },
  components: {
    ChatList,
  },
  methods: {
    // handleNewChannelEmit: function(data) {
    //   this.$emit('new-channel', data);
    // },
    selectChannel: function(data) {
      this.$emit('channel-selected', data)
      this.selectedChat = data.id;
    },
    // muteUser: function(id) {
    //   this.client.muteUser(id)
    // },
    // unmuteUser: function(id) {
    //   this.client.unmuteUser(id)
    // }
  }
}
</script>
<template>
  <div class="new-chat">
    <h1>This is a chat list page</h1>
    <ChatList
      :channels='channels'
      @channel-selected='selectChannel'
    />
    <div v-if='requests.length > 0'>
      <hr>
      <h3 v-text='"Requests"' />
      <ChatList
        :channels='requests'
        :requests='true'
        @channel-selected='selectChannel'
      />
    </div>
  </div>
</template>