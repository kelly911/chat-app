actions: {
    async register({ commit }, { email, password }) {
      try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        commit('setUsername', user.email);
      } catch (error) {
        console.error("Ошибка регистрации:", error.message);
      }
    },
    async login({ commit }, { email, password }) {
      try {
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        if (userCredential && userCredential.user) {
          const username = userCredential.user.email;
          commit('SET_AUTH', { isAuthenticated: true, username });
        }
      } catch (error) {
        console.error("Ошибка входа:", error.message);
      }
    },
    async loadConversation({ commit }, { user1, user2 }) {
      try {
        const conversationSnapshot = await db.collection('conversations')
          .where('participants', 'in', [[user1, user2], [user2, user1]])
          .get();
        
        if (conversationSnapshot.empty) {
          // Если беседа не найдена, создаем новую
          const conversationRef = await db.collection('conversations').add({
            participants: [user1, user2],
            messages: []
          });
          commit('setConversationId', conversationRef.id);
        } else {
          const conversation = conversationSnapshot.docs[0];
          commit('setConversationId', conversation.id);
          commit('setMessages', conversation.data().messages);
        }
      } catch (error) {
        console.error("Ошибка загрузки беседы:", error.message);
      }
    },
    async sendMessage({ commit, state }, text) {
      try {
        const message = {
          username: state.username,
          text,
          timestamp: new Date(),
        };
        await db.collection('conversations').doc(state.conversationId).update({
          messages: firebase.firestore.FieldValue.arrayUnion(message)
        });
        commit('addMessage', message);
      } catch (error) {
        console.error("Ошибка отправки сообщения:", error.message);
      }
    },
    logout({ commit }) {
      firebase.auth().signOut().then(() => {
        commit('SET_AUTH', { isAuthenticated: false, username: '' });
      });
    },
  },