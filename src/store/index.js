import { createStore } from 'vuex';
import firebase from 'firebase/app';
import { db } from '../firebase';
import 'firebase/auth';

const store = createStore({
  state: {
    isAuthenticated: JSON.parse(localStorage.getItem('isAuthenticated')) || false,
    username: localStorage.getItem('username') || '',
    messages: [],
    users: [],
    chats: [], 
  },
  mutations: {
    setUsername(state, username) {
      state.username = username; 
      localStorage.setItem('username', username); // Сохраняем имя пользователя в localStorage
    },
    addMessage(state, message) {
      state.messages.push(message); 
    },
    SET_AUTH(state, payload) {
      state.isAuthenticated = payload.isAuthenticated;
      state.username = payload.username;
      localStorage.setItem('isAuthenticated', JSON.stringify(payload.isAuthenticated)); // Сохраняем статус авторизации в localStorage
      localStorage.setItem('username', payload.username);
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.username = '';
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('username');
    },
    setUsers(state, users) {
      state.users = users;
    },
    setChats(state, chats) {
      state.chats = chats;
    },
  },
  actions: {
    async register({ commit }, { email, password }) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        commit('setUsername', user.email);
        commit('SET_AUTH', { isAuthenticated: true, username: user.email });
      } catch (error) {
        console.error("Ошибка регистрации:", error.message);
        throw error;
      }
    },
    async login({ commit }, { email, password }) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const username = userCredential.user.email;
        commit('SET_AUTH', { isAuthenticated: true, username });
      } catch (error) {
        console.error("Ошибка входа:", error.message);
        throw error;
      }
    },
    async logout({ commit }) {
      try {
        await firebase.auth().signOut();
        commit('clearAuth');
      } catch (error) {
        console.error('Ошибка при выходе:', error);
      }
    },
    async fetchUsers({ commit }) {
      try {
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setUsers', users);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error.message);
      }
    },
    async fetchChats({ commit }) {
      try {
        const userEmail = this.state.username;
        const snapshot = await db.collection('chats').where('participants', 'array-contains', userEmail).get();
        const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        commit('setChats', chats);
      } catch (error) {
        console.error("Ошибка загрузки чатов:", error.message);
      }
    },
    async addChat({ commit }, chatData) {
      try {
        const chatRef = await db.collection('chats').add(chatData);
        commit('setChats', [...this.state.chats, { id: chatRef.id, ...chatData }]);
      } catch (error) {
        console.error("Ошибка создания чата:", error.message);
      }
    },
    addMessage({ commit }, message) {
      commit('addMessage', message);
    },
  },
  getters: {
    getMessages(state) {
      return state.messages;
    },
    getUsername(state) {
      return state.username;
    },
    getUsers(state) {
      return state.users;
    },
    getChats(state) {
      return state.chats;
    },
  },
});

export default store;
