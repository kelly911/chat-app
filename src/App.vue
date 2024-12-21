<template>
  <div id="app">
    <nav class="navbar">
      <h1>Chat Application</h1>
      <div class="nav-links">
        <router-link v-if="isAuthenticated" to="/home" class="home-link">Home</router-link>
        <button v-if="isAuthenticated" @click="logout" class="logout-button">Logout</button>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import Cookies from 'js-cookie';

export default {
  name: 'App',
  computed: {
    ...mapState(['isAuthenticated']), // Получаем статус авторизации из Vuex
  },
  methods: {
    ...mapMutations(['SET_AUTH']), // Импортируем мутацию для установки авторизации
    logout() {
      this.SET_AUTH(false); // Устанавливаем статус авторизации в false
      Cookies.remove('authToken'); // Удаляем токен при выходе
      localStorage.removeItem('isAuthenticated'); // Удаляем статус из localStorage
      this.$router.push('/'); // Перенаправляем на страницу входа
    },
    checkAuthToken() {
      const token = Cookies.get('authToken');
      if (token) {
        this.SET_AUTH(true); // Устанавливаем авторизацию, если токен есть
      }
    }
  },
  mounted() {
    this.checkAuthToken(); // Проверяем токен при загрузке приложения
  },
};
</script>

<style>
/* Ваши стили остаются без изменений */
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  background-color: #f8f9fa;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.navbar h1 {
  margin: 0;
  font-size: 24px;
}

.nav-links {
  display: flex;
  align-items: center;
}

.home-link {
  color: white;
  text-decoration: none;
  margin-right: 20px;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.2s;
}

.home-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.logout-button {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.logout-button:hover {
  background-color: #e63939;
}
</style>
