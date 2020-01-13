<script>
export default {
  props: {
  },
  data() {
    return {
      copyOfUser: this.client.user,
      client: this.$store.state.client
    }
  },
  methods: {
    updateProfile: function() {
      const update = {
        id: this.client.userID,
        set: {
          name: this.copyOfUser.name
        }
      }
      this.client.partialUpdateUser(update);
    }
  }
}
</script>
<template>
  <div>
    <div>
      <button @click='$emit("close-profile")'>Back</button>
      <h2 v-text='"PROFILE"'  />
    </div>
    <div>
      <label>Name</label>
      <input v-model='copyOfUser.name'>
      <p v-text='copyOfUser.mutes.join(", ")' />
      <div>
        <button @click='updateProfile'>Update Profile</button>
      </div>
    </div>
    
  </div>
</template>