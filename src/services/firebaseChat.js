import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';

class FirebaseChatService {
  constructor() {
    this.currentUser = null;
    this.unsubscribeFunctions = new Map();
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Get or create chat between two users
  async getOrCreateChat(user1Id, user2Id) {
    try {
      console.log('🔄 Getting or creating chat between:', user1Id, user2Id);
      
      // Create a unique chat ID (sorted to ensure consistency)
      const chatId = [user1Id, user2Id].sort().join('_');
      
      // Check if chat exists
      const chatRef = doc(db, 'chats', chatId);
      const chatDoc = await getDoc(chatRef);
      
      if (chatDoc.exists()) {
        console.log('✅ Found existing chat:', chatDoc.data());
        return {
          id: chatId,
          ...chatDoc.data()
        };
      }

      // Create new chat
      console.log('🔄 Creating new chat...');
      const newChat = {
        members: [user1Id, user2Id],
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        lastMessageSender: '',
        typing: { userId: '', isTyping: false },
        unreadCounts: { [user1Id]: 0, [user2Id]: 0 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(chatRef, newChat);
      
      console.log('✅ Created new chat:', { id: chatId, ...newChat });
      return {
        id: chatId,
        ...newChat
      };
    } catch (error) {
      console.error('❌ Error in getOrCreateChat:', error);
      throw error;
    }
  }

  // Get all chats for the current user
  async getUserChats() {
    try {
      console.log('🔄 Getting chats for user:', this.currentUser?.id);
      
      if (!this.currentUser?.id) {
        console.log('⚠️ No current user, returning empty chats');
        return [];
      }

      // Query chats where current user is in members array
      const chatsQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', this.currentUser.id),
        orderBy('lastMessageTime', 'desc')
      );

      const chatsSnapshot = await getDocs(chatsQuery);
      const chats = [];

      for (const chatDoc of chatsSnapshot.docs) {
        const chatData = chatDoc.data();
        chats.push({
          id: chatDoc.id,
          ...chatData
        });
      }

      console.log('✅ Found chats:', chats);
      return chats;
    } catch (error) {
      console.error('❌ Error in getUserChats:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      console.log('🔄 Getting messages for chat:', chatId);
      
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = [];

      messagesSnapshot.forEach(doc => {
        const messageData = doc.data();
        messages.push({
          id: doc.id,
          ...messageData,
          createdAt: messageData.createdAt?.toDate?.() || messageData.createdAt
        });
      });

      console.log('✅ Found messages:', messages);
      return messages;
    } catch (error) {
      console.error('❌ Error in getChatMessages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId, senderId, text) {
    try {
      console.log('🔄 Sending message:', { chatId, senderId, text });
      
      const chatRef = doc(db, 'chats', chatId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Get the other user ID
      const chatDoc = await getDoc(chatRef);
      if (!chatDoc.exists()) {
        throw new Error('Chat not found');
      }
      
      const chatData = chatDoc.data();
      const otherUserId = chatData.members.find(id => id !== senderId);
      
      // Add message to subcollection
      const messageData = {
        text,
        senderId,
        createdAt: serverTimestamp(),
        readBy: [senderId] // Sender always reads their own message
      };
      
      const messageRef = await addDoc(messagesRef, messageData);
      
      // Update chat document
      await updateDoc(chatRef, {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderId,
        [`unreadCounts.${otherUserId}`]: increment(1),
        typing: { userId: '', isTyping: false }, // Reset typing state
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Message sent successfully');
      return {
        id: messageRef.id,
        ...messageData
      };
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, userId) {
    try {
      console.log('🔄 Marking messages as read:', { chatId, userId });
      
      const chatRef = doc(db, 'chats', chatId);
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      
      // Get unread messages where user is not in readBy
      const unreadMessagesQuery = query(
        messagesRef,
        where('senderId', '!=', userId),
        where('readBy', 'not-in', [[userId]])
      );
      
      const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
      
      // Update each unread message
      const updatePromises = unreadMessagesSnapshot.docs.map(doc => {
        return updateDoc(doc.ref, {
          readBy: arrayUnion(userId)
        });
      });
      
      await Promise.all(updatePromises);
      
      // Reset unread count for this user
      await updateDoc(chatRef, {
        [`unreadCounts.${userId}`]: 0
      });
      
      console.log('✅ Messages marked as read');
    } catch (error) {
      console.error('❌ Error in markMessagesAsRead:', error);
      throw error;
    }
  }

  // Subscribe to messages in real-time
  subscribeToMessages(chatId, callback) {
    try {
      console.log('🔄 Subscribing to messages for chat:', chatId);
      
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messages = [];
        snapshot.forEach(doc => {
          const messageData = doc.data();
          messages.push({
            id: doc.id,
            ...messageData,
            createdAt: messageData.createdAt?.toDate?.() || messageData.createdAt
          });
        });
        callback(messages);
      });

      this.unsubscribeFunctions.set(`messages_${chatId}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error in subscribeToMessages:', error);
      throw error;
    }
  }

  // Subscribe to chat updates (for typing indicators and last message)
  subscribeToChat(chatId, callback) {
    try {
      console.log('🔄 Subscribing to chat updates:', chatId);
      
      const chatRef = doc(db, 'chats', chatId);
      
      const unsubscribe = onSnapshot(chatRef, (doc) => {
        if (doc.exists()) {
          const chatData = doc.data();
          callback({
            id: doc.id,
            ...chatData
          });
        }
      });

      this.unsubscribeFunctions.set(`chat_${chatId}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error in subscribeToChat:', error);
      throw error;
    }
  }

  // Send typing indicator
  async sendTypingIndicator(chatId, userId, isTyping) {
    try {
      console.log('🔄 Sending typing indicator:', { chatId, userId, isTyping });
      
      const chatRef = doc(db, 'chats', chatId);
      
      await updateDoc(chatRef, {
        typing: { userId, isTyping },
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Typing indicator sent');
    } catch (error) {
      console.error('❌ Error in sendTypingIndicator:', error);
      throw error;
    }
  }

  // Subscribe to typing indicators
  subscribeToTyping(chatId, callback) {
    try {
      console.log('🔄 Subscribing to typing indicators:', chatId);
      
      const chatRef = doc(db, 'chats', chatId);
      
      const unsubscribe = onSnapshot(chatRef, (doc) => {
        if (doc.exists()) {
          const chatData = doc.data();
          if (chatData.typing) {
            callback(chatData.typing);
          }
        }
      });

      this.unsubscribeFunctions.set(`typing_${chatId}`, unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error in subscribeToTyping:', error);
      throw error;
    }
  }

  // Subscribe to all chats for the current user
  subscribeToChats(callback) {
    try {
      console.log('🔄 Subscribing to all chats for user:', this.currentUser?.id);
      
      if (!this.currentUser?.id) {
        console.log('⚠️ No current user, cannot subscribe to chats');
        return null;
      }

      const chatsQuery = query(
        collection(db, 'chats'),
        where('members', 'array-contains', this.currentUser.id),
        orderBy('lastMessageTime', 'desc')
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
        const chats = [];
        snapshot.forEach(doc => {
          const chatData = doc.data();
          chats.push({
            id: doc.id,
            ...chatData
          });
        });
        callback(chats);
      });

      this.unsubscribeFunctions.set('chats', unsubscribe);
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error in subscribeToChats:', error);
      throw error;
    }
  }

  // Unsubscribe from specific subscription
  unsubscribe(subscriptionKey) {
    const unsubscribe = this.unsubscribeFunctions.get(subscriptionKey);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribeFunctions.delete(subscriptionKey);
      console.log('✅ Unsubscribed from:', subscriptionKey);
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll() {
    console.log('🔄 Unsubscribing from all subscriptions');
    this.unsubscribeFunctions.forEach((unsubscribe, key) => {
      unsubscribe();
      console.log('✅ Unsubscribed from:', key);
    });
    this.unsubscribeFunctions.clear();
  }
}

export default new FirebaseChatService();
