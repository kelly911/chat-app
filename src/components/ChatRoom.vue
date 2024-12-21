<template>
  <div class="chat-room container-fluid">
    <div class="chat-content d-flex flex-column">
      <div class="chat-header d-flex align-items-center justify-content-between">
        <button class="burger-button" @click="toggleDropdown">
          &#9776;
        </button>
        <h2 class="m-0 flex-grow-1 text-center">
          Чат
        </h2>
      </div>
      
      <transition name="fade">
        <div class="dropdown" v-if="dropdownOpen">
          <h4>Ваши чаты</h4>
          <ul class="chat-list list-group">
            <li 
              v-for="chat in userChats" 
              :key="chat.id" 
              @click="goToChat(chat.id)"
              class="chat-item list-group-item"
            >
              <span class="chat-title">
                {{ chat.user1 === getUsername ? chat.user2 : chat.user1 }}
              </span>
            </li>
          </ul>
        </div>
      </transition>

      <div class="messages flex-grow-1 overflow-auto p-3 border border-secondary rounded bg-white shadow-sm">
        <div v-if="sortedMessages.length === 0">
          В чате пока нет сообщений
        </div>
        <div v-for="(message, index) in sortedMessages" :key="index">
          <ChatMessage 
            :username="message.sender" 
            :text="message.text" 
            :timestamp="formatTimestamp(message.timestamp)" 
          />
        </div>
      </div>

      <div class="message-input d-flex justify-content-between align-items-center">
        <input
          type="text"
          v-model="newMessage"
          placeholder="Введите ваше сообщение..."
          class="form-control me-2"
          @keyup.enter="sendMessage"
        />
        <button class="btn btn-primary" @click="sendMessage">Отправить</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { db } from '../firebase';
import { collection, query, where, addDoc, Timestamp, onSnapshot, getDocs } from 'firebase/firestore';
import ChatMessage from './ChatMessage.vue';

export default {
  name: 'ChatRoom',
  components: {
    ChatMessage,
  },
  data() {
    return {
      newMessage: '',
      messages: [],
      chatId: this.$route.params.chatId,
      otherUser: 'Имя собеседника',
      userChats: [],
      dropdownOpen: false,
      audio: null,
    };
  },
  computed: {
    ...mapGetters(['getUsername']),
    sortedMessages() {
      return this.messages.slice().sort((a, b) => a.timestamp - b.timestamp);
    },
  },
  methods: {
    async sendMessage() {
      if (this.newMessage.trim() === '') return;

      const message = {
        text: this.newMessage,
        sender: this.getUsername,
        timestamp: Timestamp.now(),
      };

      try {
        await addDoc(collection(db, 'messages'), {
          ...message,
          chatId: this.chatId,
        });

        this.newMessage = '';
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
      }
    },
    subscribeToMessages() {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('chatId', '==', this.chatId));

      onSnapshot(q, (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        }));

        if (newMessages.length > this.messages.length) {
          const lastMessage = newMessages[newMessages.length - 1];

          if (lastMessage.sender !== this.getUsername) {
            this.playNotificationSound();
          }
        }

        this.messages = newMessages;
        this.$nextTick(() => {
          const messagesContainer = this.$el.querySelector('.messages');
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
      }, (error) => {
        console.error('Ошибка получения сообщений:', error);
      });
    },
    playNotificationSound() {
      if (!this.audio) {
        this.audio = new Audio('/sounds/notification.mp3');
      }
      this.audio.play().catch(error => {
        console.error('Ошибка воспроизведения звука новго сообщения:', error);
      });
    },
    formatTimestamp(timestamp) {
      return new Date(timestamp).toLocaleString('ru-RU', {
        year: 'numeric', 
        month: 'numeric', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    },
    async fetchUserChats() {
      const chatsRef = collection(db, 'chats');
      const userChats = [];

      const q1 = query(chatsRef, where('user1', '==', this.getUsername));
      const snapshot1 = await getDocs(q1);
      snapshot1.forEach(doc => {
        userChats.push({ id: doc.id, ...doc.data() });
      });

      const q2 = query(chatsRef, where('user2', '==', this.getUsername));
      const snapshot2 = await getDocs(q2);
      snapshot2.forEach(doc => {
        userChats.push({ id: doc.id, ...doc.data() });
      });

      this.userChats = userChats;
    },
    goToChat(chatId) {
      this.chatId = chatId;
      this.$router.push({ name: 'ChatRoom', params: { chatId } });
      this.dropdownOpen = false;
      this.subscribeToMessages();
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }
  },
  watch: {
    chatId: 'subscribeToMessages',
  },
  mounted() {
    if (!this.chatId) {
      console.error('chatId is not provided. Unable to fetch messages.');
      return;
    }

    this.subscribeToMessages();
    this.fetchUserChats();
  },
};
</script>

<style scoped>
.chat-room {
  height: 85vh;
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chat-content {
  width: 100%;
  max-width: 900px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.chat-header {
  position: relative;
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.burger-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
}

.messages {
  max-height: 60vh;
  overflow-y: auto;
  margin: 20px 0;
}

.message-input {
  padding-top: 10px;
}
</style>
