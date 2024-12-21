<template>
    <div class="chat-page">
      <ChatRoom />
    </div>
  </template>
  
  <script>
  import ChatRoom from '../components/ChatRoom.vue';
  
  export default {
    components: {
      ChatRoom,
    },
  };
  </script>
  
  <style scoped>
  .chat-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 90vh;
    background-color: #f3f4f6;
  }
  </style>
  