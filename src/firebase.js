import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyASSRjyCdxS5yrlwFKubfswe9kSJ8RwTYg",

  authDomain: "chat-app-6834f.firebaseapp.com",

  projectId: "chat-app-6834f",

  storageBucket: "chat-app-6834f.appspot.com",

  messagingSenderId: "881251109160",

  appId: "1:881251109160:web:9929a40746fad3f389a81d"

};


const app = initializeApp(firebaseConfig);

// Экспортируем аутентификацию и Firestore для использования в других компонентах
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };