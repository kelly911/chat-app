<template>
  <div class="login-container">
    <h1>Вход</h1>
    <form @submit.prevent="submitForm" class="login-form">
      <input
        type="text"
        v-model="email"
        placeholder="Электронная почта"
        required
        class="login-input"
      />
      <input
        type="password"
        v-model="password"
        placeholder="Пароль"
        required
        class="login-input"
      />
      <div class="checkbox-container">
        <input type="checkbox" v-model="newUser" id="newUserCheckbox" />
        <label for="newUserCheckbox" class="checkbox-label">Новый пользователь</label>
      </div>
      <p v-if="newUser" class="hint">
        <i class="hint-icon">🔍</i>
        Пожалуйста, заполните поля <strong>Электронная почта</strong> и <strong>Пароль</strong>, чтобы создать новую учетную запись.
      </p>
      <button v-if="!newUser" type="submit" class="login-button">Войти</button>
      <button v-if="newUser" type="submit" class="register-button">Зарегистрироваться</button>
    </form>
    <!-- Сообщение об ошибке -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      newUser: false,
      errorMessage: '',
    };
  },
  methods: {
    ...mapMutations(['SET_AUTH']),
    async submitForm() {
      this.errorMessage = '';
      if (this.newUser) {
        await this.register();
      } else {
        await this.login();
      }
    },
    async login() {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);

        // Токен в куки на 7 дней
        Cookies.set('userToken', userCredential.user.accessToken, { expires: 7 });

        this.SET_AUTH({ isAuthenticated: true, username: this.email });
        this.$router.push({ name: 'HomePage' });

        // Показ всплывающего окна об использовании куки
        this.showCookiePopup();
      } catch (error) {
        this.handleError(error);
      }
    },
    async register() {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
        const username = userCredential.user.email;
        
        Cookies.set('userToken', userCredential.user.accessToken, { expires: 7 });
        
        this.SET_AUTH({ isAuthenticated: true, username });
        await this.addUserToFirestore(userCredential.user.email);
        alert('Регистрация успешна!');
        this.$router.push({ name: 'HomePage' });

        this.showCookiePopup();
      } catch (error) {
        this.handleError(error);
      }
    },
    async addUserToFirestore(email) {
      try {
        await addDoc(collection(db, 'users'), {
          email: email,
        });
      } catch (error) {
        console.error('Ошибка при добавлении пользователя в Firestore:', error);
      }
    },
    handleError(error) {
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = "Пользователь не найден. Пожалуйста, проверьте адрес электронной почты.";
          break;
        case 'auth/wrong-password':
          this.errorMessage = "Неверный пароль. Пожалуйста, попробуйте снова.";
          break;
        case 'auth/invalid-email':
          this.errorMessage = "Указан неверный адрес электронной почты. Пожалуйста, проверьте и попробуйте снова.";
          break;
        case 'auth/user-disabled':
          this.errorMessage = "Ваш аккаунт отключен. Пожалуйста, свяжитесь с поддержкой.";
          break;
        case 'auth/email-already-in-use':
          this.errorMessage = "Этот адрес электронной почты уже зарегистрирован. Пожалуйста, используйте другой адрес или выполните вход.";
          break;
        case 'auth/operation-not-allowed':
          this.errorMessage = "Регистрация с помощью электронной почты временно недоступна. Пожалуйста, попробуйте позже.";
          break;
        case 'auth/weak-password':
          this.errorMessage = "Пароль слишком слабый. Пожалуйста, используйте более сложный пароль (не менее 6 символов).";
          break;
        case 'auth/too-many-requests':
          this.errorMessage = "Слишком много попыток. Пожалуйста, подождите немного и попробуйте снова.";
          break;
        default:
          this.errorMessage = "Произошла ошибка. Пожалуйста, попробуйте снова.";
          break;
      }
    },
    showCookiePopup() {
      alert("Этот сайт использует куки для улучшения работы. Продолжая, вы соглашаетесь с этим.");
    }
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh; 
  background-color: #f0f0f0; 
}

.login-form {
  display: flex;
  flex-direction: column;
  width: 300px; 
  padding: 20px; 
  border: 1px solid #ccc; 
  border-radius: 10px; 
  background-color: #fff; 
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); 
}

.login-input {
  margin-bottom: 15px; 
  padding: 10px; 
  border: 1px solid #ccc; 
  border-radius: 5px; 
  font-size: 16px; 
}

.checkbox-container {
  display: flex;
  align-items: center;
  margin-bottom: 15px; 
}

.checkbox-container input[type="checkbox"] {
  display: none; 
}

.checkbox-container .checkbox-label {
  position: relative;
  padding-left: 34px; 
  padding-top: 4px;
  cursor: pointer; 
  font-size: 16px; 
}

.checkbox-container .checkbox-label::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 20px; 
  height: 20px; 
  border: 2px solid #007bff; 
  border-radius: 4px; 
  background: white; 
  transition: background 0.3s, border-color 0.3s;
}

.checkbox-container input[type="checkbox"]:checked + .checkbox-label::before {
  background: #007bff;
  border-color: #007bff;
}


.checkbox-container .checkbox-label::after {
  content: none; 
}

.login-button, .register-button {
  padding: 10px; 
  border: none; 
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
  margin-bottom: 10px; /* Отступ между кнопками */
}

.login-button {
  background-color: #007bff; 
  color: #fff; 
}

.login-button:hover {
  background-color: #0056b3; 
}

.register-button {
  background-color: #28a745; 
  color: #fff; 
}

.register-button:hover {
  background-color: #218838; 
}

/* Стили для подсказки */
.hint {
  color: #555; 
  margin-top: 10px; 
  font-size: 14px; 
}

/* Стили для сообщения об ошибке */
.error-message {
  color: red; 
  margin-top: 10px; 
  font-size: 14px;
}
</style>
