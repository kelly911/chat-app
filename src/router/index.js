import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase';
import HomePage from '../components/HomePage.vue';
import ChatRoom from '../components/ChatRoom.vue';
import LoginPage from '../views/LoginPage.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/home',
    name: 'HomePage',
    component: HomePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/chat/:chatId',
    name: 'ChatRoom',
    component: ChatRoom,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const user = auth.currentUser || JSON.parse(localStorage.getItem('isAuthenticated'));

  if (requiresAuth && !user) {
    next({ name: 'Login' });
  } else if (to.name === 'Login' && user) {
    next({ name: 'HomePage' });
  } else {
    next();
  }
});

export default router;
