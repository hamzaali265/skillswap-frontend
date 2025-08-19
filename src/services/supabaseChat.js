import { supabase } from './supabase';

class SupabaseChatService {
  constructor() {
    this.currentUser = null;
    this.realtimeSubscriptions = new Map();
    this.supabase = supabase; // Add supabase property for direct access
  }

  // Set current user
  setCurrentUser(user) {
    this.currentUser = user;
  }

  // Get or create chat between two users
  async getOrCreateChat(user1Id, user2Id) {
    try {
      console.log('🔄 Getting or creating chat between:', user1Id, user2Id);
      
      // Check current user authentication
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('🔐 Current authenticated user:', currentUser);
      
      // First, try to find existing chat with a simpler query
      const { data: existingChats, error: findError } = await supabase
        .from('chats')
        .select('*')
        .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`);

      if (findError) {
        console.error('❌ Error finding chat:', findError);
        throw findError;
      }

      if (existingChats && existingChats.length > 0) {
        console.log('✅ Found existing chat:', existingChats[0]);
        return existingChats[0];
      }

      // Create new chat if none exists
      console.log('🔄 Creating new chat...');
      const { data: newChat, error: createError } = await supabase
        .from('chats')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating chat:', createError);
        throw createError;
      }

      console.log('✅ Created new chat:', newChat);
      return newChat;
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

      // Get chats without foreign key relationships
      const { data: chats, error } = await supabase
        .from('chats')
        .select('*')
        .or(`user1_id.eq.${this.currentUser.id},user2_id.eq.${this.currentUser.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error getting chats:', error);
        throw error;
      }

      // Get messages for each chat
      const chatsWithMessages = await Promise.all(
        chats.map(async (chat) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chat.id)
            .order('created_at', { ascending: true });

          return {
            ...chat,
            messages: messages || []
          };
        })
      );

      // Fetch user data from API to get real user information
      let allUsers = [];
      try {
        const { default: apiService } = await import('./api');
        const matchesResponse = await apiService.getMatchesAlternative();
        if (matchesResponse.data) {
          allUsers = matchesResponse.data.users || matchesResponse.data || [];
          console.log('✅ Fetched user data from API:', allUsers);
        }
      } catch (apiError) {
        console.warn('⚠️ Could not fetch user data from API:', apiError.message);
      }

      // Transform data to match our app's format with real user data
      const transformedChats = chatsWithMessages.map(chat => {
        const otherUserId = chat.user1_id === this.currentUser?.id ? chat.user2_id : chat.user1_id;
        const lastMessage = chat.messages?.[chat.messages.length - 1];
        
        // Find real user data
        const realUserData = allUsers.find(user => user.id === otherUserId);
        
        return {
          id: chat.id,
          user: realUserData ? {
            id: otherUserId,
            name: realUserData.name || `User ${otherUserId.slice(0, 8)}`,
            avatar: realUserData.avatar || '',
            bio: realUserData.bio || '',
            location: realUserData.location || '',
            skillsOffered: realUserData.skillsOffered || [],
            skillsWanted: realUserData.skillsWanted || [],
            status: realUserData.isOnline ? 'online' : 'offline',
            averageRating: realUserData.averageRating || 0,
            ratingCount: realUserData.ratingCount || 0
          } : {
            id: otherUserId,
            name: `User ${otherUserId.slice(0, 8)}`,
            avatar: '',
            bio: '',
            location: '',
            skillsOffered: [],
            skillsWanted: [],
            status: 'offline',
            averageRating: 0,
            ratingCount: 0
          },
          lastMessage: lastMessage ? {
            text: lastMessage.content,
            timestamp: lastMessage.created_at
          } : {
            text: 'Start a conversation to connect!',
            timestamp: chat.created_at
          },
          unreadCount: chat.messages?.filter(m => !m.is_read && m.sender_id !== this.currentUser?.id).length || 0
        };
      });

      console.log('✅ Got chats with real user data:', transformedChats);
      return transformedChats;
    } catch (error) {
      console.error('❌ Error in getUserChats:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId) {
    try {
      console.log('🔄 Getting messages for chat:', chatId);
      
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error getting messages:', error);
        throw error;
      }

      // Transform messages to match our app's format
      const transformedMessages = messages.map(message => ({
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        text: message.content,
        timestamp: message.created_at,
        isRead: message.is_read
      }));

      console.log('✅ Got messages:', transformedMessages);
      return transformedMessages;
    } catch (error) {
      console.error('❌ Error in getChatMessages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId, content) {
    try {
      console.log('🔄 Sending message to chat:', chatId, 'content:', content);
      
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: this.currentUser?.id,
          content: content
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      // Update chat's updated_at timestamp
      await supabase
        .from('chats')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', chatId);

      const transformedMessage = {
        id: message.id,
        chatId: message.chat_id,
        senderId: message.sender_id,
        text: message.content,
        timestamp: message.created_at,
        isRead: message.is_read
      };

      console.log('✅ Message sent:', transformedMessage);
      return transformedMessage;
    } catch (error) {
      console.error('❌ Error in sendMessage:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, senderId) {
    try {
      console.log('🔄 Marking messages as read for chat:', chatId, 'sender:', senderId);
      
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('chat_id', chatId)
        .eq('sender_id', senderId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ Error marking messages as read:', error);
        throw error;
      }

      console.log('✅ Messages marked as read');
    } catch (error) {
      console.error('❌ Error in markMessagesAsRead:', error);
      throw error;
    }
  }

  // Subscribe to real-time messages
  subscribeToMessages(chatId, callback) {
    console.log('🔄 Subscribing to messages for chat:', chatId);
    
    const subscription = supabase
      .channel(`messages:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('📨 New message received:', payload);
          const message = {
            id: payload.new.id,
            chatId: payload.new.chat_id,
            senderId: payload.new.sender_id,
            text: payload.new.content,
            timestamp: payload.new.created_at,
            isRead: payload.new.is_read
          };
          callback(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('📨 Message updated:', payload);
          // Handle message updates (e.g., read receipts)
          callback({ type: 'update', message: payload.new });
        }
      )
      .subscribe();

    this.realtimeSubscriptions.set(chatId, subscription);
    return subscription;
  }

  // Subscribe to chat updates
  subscribeToChats(callback) {
    console.log('🔄 Subscribing to chat updates');
    
    const subscription = supabase
      .channel('chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `user1_id=eq.${this.currentUser?.id} OR user2_id=eq.${this.currentUser?.id}`
        },
        (payload) => {
          console.log('📨 Chat update received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.realtimeSubscriptions.set('chats', subscription);
    return subscription;
  }

  // Unsubscribe from real-time updates
  unsubscribe(chatId) {
    const subscription = this.realtimeSubscriptions.get(chatId);
    if (subscription) {
      console.log('🔌 Unsubscribing from:', chatId);
      supabase.removeChannel(subscription);
      this.realtimeSubscriptions.delete(chatId);
    }
  }

  // Unsubscribe from all updates
  unsubscribeAll() {
    console.log('🔌 Unsubscribing from all channels');
    this.realtimeSubscriptions.forEach((subscription, key) => {
      supabase.removeChannel(subscription);
    });
    this.realtimeSubscriptions.clear();
  }
}

export default new SupabaseChatService();
