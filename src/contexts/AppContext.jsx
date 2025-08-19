import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import apiService from '../services/api';
import firebaseChatService from '../services/firebaseChat';
import { useAuth } from '../hooks/useAuth';
import { setLocalStorage } from '../utils/helpers';

// Initial state
const initialState = {
  users: [],
  matches: [],
  chats: [],
  messages: {},
  currentChat: null,
  searchQuery: '',
  filters: {
    skillLevel: 'all'
  },
  loading: false,
  error: null,
  usingMockData: false
};

// Action types
const ACTIONS = {
  SET_USERS: 'SET_USERS',
  SET_MATCHES: 'SET_MATCHES',
  SET_CHATS: 'SET_CHATS',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_USING_MOCK_DATA: 'SET_USING_MOCK_DATA',
  UPDATE_CURRENT_USER: 'UPDATE_CURRENT_USER'
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USERS:
      return {
        ...state,
        users: action.payload
      };
    
    case ACTIONS.SET_MATCHES:
      return {
        ...state,
        matches: action.payload
      };
    
    case ACTIONS.SET_CHATS:
      return {
        ...state,
        chats: action.payload
      };
    
    case ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.chatId]: action.payload.messages
        }
      };
    
    case ACTIONS.ADD_MESSAGE:
      const { chatId, message } = action.payload;
      const existingMessages = state.messages[chatId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: [...existingMessages, message]
        }
      };
    
    case ACTIONS.SET_CURRENT_CHAT:
      return {
        ...state,
        currentChat: action.payload
      };
    
    case ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      };
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };
    
    case ACTIONS.UPDATE_USER_STATUS:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { ...user, status: action.payload.status }
            : user
        )
      };
    
    case ACTIONS.MARK_MESSAGE_READ:
      const { messageId } = action.payload;
      return {
        ...state,
        messages: Object.keys(state.messages).reduce((acc, chatId) => {
          acc[chatId] = state.messages[chatId].map(msg =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
          return acc;
        }, {})
      };
    
    case ACTIONS.SET_USING_MOCK_DATA:
      return {
        ...state,
        usingMockData: action.payload
      };
    
    case ACTIONS.UPDATE_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Create refreshData function with useCallback to avoid dependency issues
  const refreshData = useCallback(async () => {
    if (!user) {
      console.log('User not authenticated, skipping data refresh');
      return;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    
    try {
      console.log('🔄 Starting data refresh...');
      
      // Set current user for Supabase chat service
      firebaseChatService.setCurrentUser(user);
      
      // Load matches and users from your existing backend API
      try {
        const matchesResponse = await apiService.getMatchesAlternative();
        console.log('✅ Matches loaded successfully:', matchesResponse);
        
        // Extract users and matches from response (using your original data structure)
        const users = matchesResponse.users || matchesResponse.data || [];
        const matches = matchesResponse.matches || matchesResponse.data || [];
        
        // Debug: Log the data structure
        console.log('🔍 Users data:', users);
        console.log('🔍 Matches data:', matches);
        
        if (users.length > 0) {
          console.log('🔍 First user skills offered:', users[0].skillsOffered);
          console.log('🔍 First user skills wanted:', users[0].skillsWanted);
        }
        
        dispatch({ type: ACTIONS.SET_USERS, payload: users });
        dispatch({ type: ACTIONS.SET_MATCHES, payload: matches });
        
        // Also fetch current user's profile to get complete skills data
        try {
          console.log('🔄 Fetching current user profile...');
          const profileResponse = await apiService.getProfile();
          console.log('✅ Profile loaded successfully:', profileResponse);
          
          if (profileResponse.data) {
            // Update the current user with complete profile data including skills
            const updatedUser = {
              ...user,
              ...profileResponse.data,
              skillsOffered: profileResponse.data.skillsOffered || [],
              skillsWanted: profileResponse.data.skillsWanted || []
            };
            
            console.log('✅ Updated user with skills:', updatedUser);
            // Update the user in localStorage and context
            setLocalStorage('skillswap_user', updatedUser);
            // Update the current user in the app context
            actions.updateCurrentUser(updatedUser);
          }
        } catch (profileError) {
          console.warn('⚠️ Could not load user profile:', profileError.message);
        }
        
      } catch (matchesError) {
        console.warn('⚠️ Matches endpoint not available:', matchesError.message);
        console.log('💡 Please check if your backend has the correct endpoint for matches');
        // Don't fail the entire refresh if matches endpoint doesn't exist
        dispatch({ type: ACTIONS.SET_USERS, payload: [] });
        dispatch({ type: ACTIONS.SET_MATCHES, payload: [] });
      }
      
      // Load chats from Supabase (separate from your backend)
      try {
        console.log('🔄 Loading chats from Supabase...');
        const chats = await firebaseChatService.getUserChats();
        console.log('✅ Chats loaded from Supabase:', chats);
        dispatch({ type: ACTIONS.SET_CHATS, payload: chats });
      } catch (chatsError) {
        console.error('❌ Error loading chats from Supabase:', chatsError);
        // Fallback to empty chats array
        dispatch({ type: ACTIONS.SET_CHATS, payload: [] });
      }
      
      console.log('✅ Data refresh completed successfully');
      
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [user]);

  // Initialize data only when user is authenticated
  useEffect(() => {
    if (user) {
      refreshData();
      
      // Set up Supabase real-time subscriptions
      const handleChatUpdate = (payload) => {
        console.log('📨 Chat update received via Supabase:', payload);
        // Refresh chats when there's an update
        refreshData();
      };

      // Subscribe to chat updates
      firebaseChatService.subscribeToChats(handleChatUpdate);

      // Cleanup function
      return () => {
        firebaseChatService.unsubscribeAll();
      };
    }
  }, [user, refreshData]);

  // Actions
  const actions = {
    setSearchQuery: useCallback((query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    }, []),
    
    setFilters: useCallback((filters) => {
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
    }, []),
    
    setCurrentChat: useCallback((chat) => {
      dispatch({ type: ACTIONS.SET_CURRENT_CHAT, payload: chat });
    }, []),
    
    sendMessage: useCallback(async (chatId, text) => {
      try {
        console.log('🔄 Sending message to chat:', chatId, 'text:', text);
        
        // Send message via Firebase
        const message = await firebaseChatService.sendMessage(chatId, user.id, text);
        
        // Add message locally immediately for instant feedback
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } });
        
        console.log('✅ Message sent via Firebase');
        
      } catch (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }
    }, [user?.id]),
    
    loadChatHistory: useCallback(async (userId) => {
      try {
        console.log('🔄 Loading chat history for user:', userId);
        
        // Get or create the chat first to get the chat ID
        const chat = await firebaseChatService.getOrCreateChat(user.id, userId);
        
        // Load messages for this chat
        const messages = await firebaseChatService.getChatMessages(chat.id);
        
        // Store messages in state using chat.id as the key
        dispatch({ 
          type: ACTIONS.SET_MESSAGES, 
          payload: { 
            chatId: chat.id, 
            messages: messages || [] 
          } 
        });
        
        console.log('✅ Chat history loaded:', messages?.length, 'messages');
        return messages;
        
      } catch (error) {
        console.error('❌ Error loading chat history:', error);
        // Set empty messages array on error
        dispatch({ 
          type: ACTIONS.SET_MESSAGES, 
          payload: { 
            chatId: userId, 
            messages: [] 
          } 
        });
        throw error;
      }
    }, [user?.id]),
    
    markMessageRead: useCallback((messageId) => {
      dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: { messageId } });
    }, []),
    
    markChatAsRead: useCallback(async (chatId, userId) => {
      try {
        console.log('🔄 Marking chat as read:', chatId, 'for user:', userId);
        
        // Mark messages as read in Firebase
        await firebaseChatService.markMessagesAsRead(chatId, userId);
        
        console.log('✅ Messages marked as read');
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    }, []),
    
    updateUserStatus: useCallback((userId, status) => {
      dispatch({ type: ACTIONS.UPDATE_USER_STATUS, payload: { userId, status } });
    }, []),
    
    clearError: useCallback(() => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    }, []),

    // Update current user with skills data
    updateCurrentUser: useCallback((userData) => {
      dispatch({ type: ACTIONS.UPDATE_CURRENT_USER, payload: userData });
    }, []),

    // Refresh data from API
    refreshData: refreshData,

    // Create a new conversation with a user
    createConversation: useCallback(async (userId, userData) => {
      try {
        console.log('🔄 Creating conversation with user:', userId);
        
        // First, try to get or create the chat in Firebase
        const chat = await firebaseChatService.getOrCreateChat(user.id, userId);
        
        // Check if this chat already exists in our local state
        const existingChat = state.chats.find(c => c.id === chat.id);
        
        if (existingChat) {
          console.log('✅ Chat already exists locally:', existingChat);
          return existingChat;
        }
        
        // Try to fetch complete user data from API if not provided
        let completeUserData = userData;
        if (!userData || !userData.name || userData.name === 'Unknown User') {
          try {
            console.log('🔄 Fetching user data from API for user:', userId);
            // Try to get user data from matches first
            const matchesResponse = await apiService.getMatchesAlternative();
            if (matchesResponse.data) {
              const allUsers = matchesResponse.data.users || matchesResponse.data || [];
              const foundUser = allUsers.find(u => u.id === userId);
              if (foundUser) {
                completeUserData = foundUser;
                console.log('✅ Found user data in matches:', foundUser);
              }
            }
          } catch (error) {
            console.warn('⚠️ Could not fetch user data from API:', error.message);
          }
        }
        
        // Create new chat object for local state with complete user data
        const newChat = {
          id: chat.id,
          members: chat.members,
          lastMessage: chat.lastMessage || '',
          lastMessageTime: chat.lastMessageTime,
          lastMessageSender: chat.lastMessageSender || '',
          typing: chat.typing || { userId: '', isTyping: false },
          unreadCounts: chat.unreadCounts || { [user.id]: 0, [userId]: 0 },
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        };
        
        // Add to local chats state
        dispatch({ type: ACTIONS.SET_CHATS, payload: [...state.chats, newChat] });
        
        console.log('✅ New chat created with user data:', newChat);
        return newChat;
        
      } catch (error) {
        console.error('❌ Error creating conversation:', error);
        throw error;
      }
    }, [user?.id, state.chats]),

    // Handle message button click - check, create, and open chat
    handleMessageButtonClick: useCallback(async (userId, userData, navigate) => {
      try {
        console.log('🔄 Message button clicked for user:', userId);
        
        // First, check if chat already exists in our loaded chats
        let existingChat = state.chats.find(chat => 
          chat.members && chat.members.includes(userId)
        );
        
        if (existingChat) {
          console.log('✅ Found existing chat, opening it');
          // Set as current chat and navigate
          dispatch({ type: ACTIONS.SET_CURRENT_CHAT, payload: existingChat });
          navigate(`/chat/${userId}`);
          return existingChat;
        }
        
        // Chat doesn't exist, create it
        console.log('🔄 Creating new chat for user:', userId);
        
        // Create the chat in Firebase
        const chat = await firebaseChatService.getOrCreateChat(user.id, userId);
        console.log('✅ Chat created in Firebase:', chat);
        
        // Check if this chat already exists in our local state (double-check)
        const existingLocalChat = state.chats.find(c => c.id === chat.id);
        
        if (existingLocalChat) {
          console.log('✅ Chat already exists locally:', existingLocalChat);
          dispatch({ type: ACTIONS.SET_CURRENT_CHAT, payload: existingLocalChat });
          navigate(`/chat/${userId}`);
          return existingLocalChat;
        }
        
        // Try to get complete user data if not provided
        let completeUserData = userData;
        if (!userData || !userData.name || userData.name === 'Unknown User') {
          try {
            console.log('🔄 Fetching user data for new chat...');
            // Try to get user data from API first
            const response = await apiService.getOtherUserProfile(userId);
            if (response.data) {
              completeUserData = response.data;
              console.log('✅ Fetched user data from API:', completeUserData);
            }
          } catch (apiError) {
            console.warn('⚠️ Could not fetch user data from API:', apiError.message);
            
            // Fallback: try to get from matches
            try {
              const matchesResponse = await apiService.getMatchesAlternative();
              if (matchesResponse.data) {
                const allUsers = matchesResponse.data.users || matchesResponse.data || [];
                const foundUser = allUsers.find(u => u.id === userId);
                if (foundUser) {
                  completeUserData = foundUser;
                  console.log('✅ Found user data in matches:', foundUser);
                }
              }
            } catch (matchesError) {
              console.warn('⚠️ Could not fetch user data from matches either:', matchesError.message);
            }
          }
        }
        
        // Create new chat object for local state
        const newChat = {
          id: chat.id,
          members: chat.members,
          lastMessage: chat.lastMessage || '',
          lastMessageTime: chat.lastMessageTime,
          lastMessageSender: chat.lastMessageSender || '',
          typing: chat.typing || { userId: '', isTyping: false },
          unreadCounts: chat.unreadCounts || { [user.id]: 0, [userId]: 0 },
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt
        };
        
        console.log('✅ New chat object created:', newChat);
        
        // Add to local chats state
        dispatch({ type: ACTIONS.SET_CHATS, payload: [...state.chats, newChat] });
        
        // Set as current chat
        dispatch({ type: ACTIONS.SET_CURRENT_CHAT, payload: newChat });
        
        // Navigate to the chat
        navigate(`/chat/${userId}`);
        
        console.log('✅ Chat created and opened successfully with user data');
        return newChat;
        
      } catch (error) {
        console.error('❌ Error handling message button click:', error);
        throw error;
      }
    }, [user?.id, state.chats]),

    // Get current chat messages
    getCurrentChatMessages: useCallback(() => {
      if (!state.currentChat?.id) return [];
      return state.messages[state.currentChat.id] || [];
    }, [state.currentChat?.id, state.messages]),

    // Refresh user data for chats
    refreshChatUserData: useCallback(async () => {
      try {
        console.log('🔄 Refreshing user data for chats...');
        
        // Fetch latest user data from API
        const matchesResponse = await apiService.getMatchesAlternative();
        if (matchesResponse.data) {
          const allUsers = matchesResponse.data.users || matchesResponse.data || [];
          console.log('✅ Fetched updated user data:', allUsers);
          
          // Update chats with fresh user data
          const updatedChats = state.chats.map(chat => {
            const realUserData = allUsers.find(user => user.id === chat.user.id);
            if (realUserData) {
              return {
                ...chat,
                user: {
                  ...chat.user,
                  name: realUserData.name || chat.user.name,
                  avatar: realUserData.avatar || chat.user.avatar,
                  bio: realUserData.bio || chat.user.bio,
                  location: realUserData.location || chat.user.location,
                  skillsOffered: realUserData.skillsOffered || chat.user.skillsOffered,
                  skillsWanted: realUserData.skillsWanted || chat.user.skillsWanted,
                  status: realUserData.isOnline ? 'online' : 'offline',
                  averageRating: realUserData.averageRating || chat.user.averageRating,
                  ratingCount: realUserData.ratingCount || chat.user.ratingCount
                }
              };
            }
            return chat;
          });
          
          dispatch({ type: ACTIONS.SET_CHATS, payload: updatedChats });
          console.log('✅ Updated chats with fresh user data');
        }
      } catch (error) {
        console.error('❌ Error refreshing chat user data:', error);
      }
    }, [state.chats]),
  };

  // Computed values
  const computed = {
    get filteredUsers() {
      try {
        let filtered = state.users || [];
        
        // Apply search filter
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(query) ||
            user.skillsOffered?.some(skill => (skill.skillName || skill.name).toLowerCase().includes(query)) ||
            user.skillsWanted?.some(skill => (skill.skillName || skill.name).toLowerCase().includes(query))
          );
        }
        
        // Apply proficiency level filter
        if (state.filters.skillLevel !== 'all') {
          filtered = filtered.filter(user =>
            user.skillsOffered?.some(skill => skill.proficiencyLevel === state.filters.skillLevel) ||
            user.skillsWanted?.some(skill => skill.urgencyLevel === state.filters.skillLevel)
          );
        }
        
        return filtered;
      } catch (error) {
        console.error('Error in filteredUsers:', error);
        return state.users || [];
      }
    },
    
    getCurrentChatMessages: () => {
      if (!state.currentChat) return [];
      // Use currentChat.id instead of currentChat.user.id for messages
      return state.messages[state.currentChat.id] || [];
    },
    
    getUnreadCount: () => {
      return state.chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
    }
  };

  const value = {
    ...state,
    ...actions,
    ...computed
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
