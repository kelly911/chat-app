<template>
  <div class="home-page">
    <h1 class="title">Добро пожаловать на главную страницу, {{ getUsername }}!</h1>
    <button @click="openModal" class="new-chat-button">Новый чат</button>

    <!-- Модальное окно для выбора пользователя -->
    <div v-if="isModalVisible" class="modal">
      <div class="modal-content">
        <span @click="closeModal" class="close-button">&times;</span>
        <h2>Выберите пользователя для нового чата:</h2>
        <div v-if="filteredUsers.length > 0">
          <ul class="user-list">
            <li v-for="user in filteredUsers" :key="user.email" class="user-item">
              <span class="user-email">{{ user.email }}</span>
              <button @click="selectUser(user.email)" class="select-button">Выбрать</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <p>Список пользователей для создания нового чата пуст</p>
        </div>
      </div>
    </div>

    <!-- Модальное окно успешного создания чата -->
    <div v-if="isSuccessModalVisible" class="modal">
      <div class="modal-content">
        <span @click="closeSuccessModal" class="close-button">&times;</span>
        <h2>Чат успешно создан!</h2>
        <p>Вы начали чат с {{ selectedUserEmail }}.</p>
        <!-- <button @click="closeSuccessModal" class="close-button"></button> -->
      </div>
    </div>

    <div v-if="loading" class="loader"></div>

    <div v-if="!loading && userChats.length" class="existing-chats">
      <h2>Существующие чаты:</h2>
      <ul class="chat-list">
        <li v-for="chat in userChats" :key="chat.id" class="chat-item">
          <span class="chat-users">{{ chat.user1 }} - {{ chat.user2 }}</span>
          <button @click="openChat(chat)" class="chat-button">Перейти в чат</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { mapGetters } from 'vuex';

export default {
  name: 'HomePage',
  data() {
    return {
      users: [],
      chats: [],
      loading: true,
      isModalVisible: false,
      isSuccessModalVisible: false,
      selectedUserEmail: '',
    };
  },
  computed: {
    ...mapGetters(['getUsername']),
    filteredUsers() {
      const currentUserEmail = this.getUsername;
      return this.users.filter(user => {
        const isCurrentUser = user.email === currentUserEmail;
        const hasChat = this.chats.some(chat =>
          (chat.user1 === currentUserEmail && chat.user2 === user.email) ||
          (chat.user2 === currentUserEmail && chat.user1 === user.email)
        );
        return !isCurrentUser && !hasChat;
      });
    },
    userChats() {
      const currentUserEmail = this.getUsername;
      return this.chats.filter(chat =>
        chat.user1 === currentUserEmail || chat.user2 === currentUserEmail
      );
    },
  },
  methods: {
    async fetchUsers() {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        this.users = querySnapshot.docs.map(doc => doc.data());
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    },
    async fetchChats() {
      try {
        const querySnapshot = await getDocs(collection(db, 'chats'));
        this.chats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        this.loading = false; // Индикатор загрузки после завершения
      } catch (error) {
        console.error('Ошибка загрузки чатов:', error);
        this.loading = false;
      }
    },
    openModal() {
      this.isModalVisible = true;
      this.fetchUsers();
      if (!this.chats.length) this.fetchChats();
    },
    closeModal() {
      this.isModalVisible = false;
    },
    closeSuccessModal() {
      this.isSuccessModalVisible = false;
      this.selectedUserEmail = '';
    },
    selectUser(userEmail) {
      this.createChat(userEmail);
      this.selectedUserEmail = userEmail;
      this.closeModal();
    },
    async createChat(userEmail) {
      const currentUserEmail = this.getUsername;
      try {
        const newChatRef = doc(collection(db, 'chats'));
        await setDoc(newChatRef, {
          user1: currentUserEmail,
          user2: userEmail,
        });
        this.isSuccessModalVisible = true;
      } catch (error) {
        console.error('Ошибка при создании чата:', error);
        alert('Ошибка при создании чата: ' + error.message);
      }
    },
    openChat(chat) {
      this.$router.push({ name: 'ChatRoom', params: { chatId: chat.id, userEmail: chat.user2 } });
    },
  },
  async beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.fetchUsers();
      vm.fetchChats();
    });
  },
};
</script>

<style scoped>
.home-page {
  padding: 20px;
  max-width: 600px;
  margin: auto;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  color: #343a40;
}

.loader {
  border: 6px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.new-chat-button {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 20px;
}

.new-chat-button:hover {
  background-color: #0056b3;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close-button {
  cursor: pointer;
  font-size: 24px;
  position: absolute;
  top: 10px;
  right: 20px;
}

.user-list, .chat-list {
  list-style-type: none;
  padding: 0;
}

.user-item, .chat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #ffffff;
  transition: background-color 0.3s;
}

.user-item:hover, .chat-item:hover {
  background-color: #f1f1f1;
}

.user-email, .chat-users {
  color: #495057;
}

.select-button, .chat-button {
  padding: 5px 10px;
  font-size: 14px;
  color: white;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.select-button:hover, .chat-button:hover {
  background-color: #218838;
}

/* Адаптивность */
@media (max-width: 768px) {
  .home-page {
    padding: 10px;
  }

  .new-chat-button {
    padding: 8px;
  }

  .modal-content {
    width: 95%;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 20px;
  }

  .select-button, .chat-button {
    font-size: 12px;
  }

  .close-button {
    font-size: 20px;
  }
}
</style>
