<script>
export default {
  data() {
    return {
      searchText: '',
      searchResults: [],
      chatUsers: [],
      client: this.$store.state.client
    }
  },
  methods: {
    create: function() {
      const userIDS = this.chatUsers.map(user => {
        return {
          user_id:user.id
        }
      });
      this.$emit('new-channel', {
        id: null,
        channel: {
          members: [{user_id: this.client.userID}, ...userIDS],
          created_by : {id: this.client.userID}
        }
      })
      this.$emit("close")
    },
    addUserToChat: function(user) {
      const userIDS = this.chatUsers.map(user => user.id);
      if(!userIDS.includes(user.id)) {this.chatUsers.push(user);}
    },
    search: function() {
      this.searchResults = [];
      if(this.searchText.length > 0) {
        this.client.queryUsers({ name: { $autocomplete: this.searchText } }).then ( r => {
          this.searchResults = r.users;
        })
      }
    }
  }
}
</script>
<template>
  <div>
    <div>
      <div v-if='chatUsers.length>0'>
        <div v-for='user in chatUsers' :key='user.id' v-text='user.name'/>
        <button @click='create'>Create</button>
      </div>
      <input v-model='searchText' />
      <button @click='search'>search</button>
    </div>
    <div>
      <div
        v-for='user in searchResults'
        :key='user.id'
      > <img :src='user.image' />
        <button @click='addUserToChat(user)'>{{user.name}}</button>
      </div>
    </div>
    <button @click='$emit("close")'>cancel</button>
  </div>
</template>