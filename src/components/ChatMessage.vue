<template>
  <div class="chat-message">
    <strong>{{ username }}</strong>: {{ text }}
    <span class="timestamp">{{ timestamp }}</span>
  </div>
</template>

<script>
export default {
  name: 'ChatMessage',
  props: {
    username: {
      type: String,
      required: true,
      default: 'User'
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: [String, Object],
      required: true,
    },
  }/* ,
  computed: {
    formattedTimestamp() {
      return new Date(this.timestamp).toLocaleString(); // Форматируем временную метку для отображения
    },
  }, */
};
</script>

<style scoped>
.chat-message {
  margin-bottom: 10px;
  padding: 5px; 
  background-color: #e9ecef;
  border-radius: 5px;
}

.timestamp {
  font-size: 0.8em;
  color: #6c757d;
  margin-left: 5px; 
}

.username {
  font-weight: bold; 
}
</style>
