import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/api';

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
  error: null
};

// Action types
const ACTIONS = {
  SET_USERS: 'SET_USERS',
  SET_MATCHES: 'SET_MATCHES',
  SET_CHATS: 'SET_CHATS',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  UPDATE_USER_STATUS: 'UPDATE_USER_STATUS',
  MARK_MESSAGE_READ: 'MARK_MESSAGE_READ'
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
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize data only when user is authenticated
  useEffect(() => {
    const initializeData = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('skillswap_token');
      if (!token) {
        // User is not authenticated, don't fetch data
        console.log('No token found, skipping data initialization');
        return;
      }

      console.log('Initializing data...');
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      try {
        // Fetch matches from API
        console.log('Fetching matches...');
        const matchesResponse = await apiService.getMatches();
        console.log('Matches response:', matchesResponse);
        
        // Extract users from matches response
        const users = matchesResponse.users || matchesResponse.matches || [];
        console.log('Extracted users:', users);
        dispatch({ type: ACTIONS.SET_USERS, payload: users });
        dispatch({ type: ACTIONS.SET_MATCHES, payload: matchesResponse.matches || [] });
        
        // Fetch conversations from API
        console.log('Fetching conversations...');
        const conversationsResponse = await apiService.getConversations();
        console.log('Conversations response:', conversationsResponse);
        dispatch({ type: ACTIONS.SET_CHATS, payload: conversationsResponse.conversations || [] });
        
      } catch (error) {
        console.error('Error initializing data:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeData();
  }, []);

  // Actions
  const actions = {
    setSearchQuery: (query) => {
      dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
    },
    
    setFilters: (filters) => {
      dispatch({ type: ACTIONS.SET_FILTERS, payload: filters });
    },
    
    setCurrentChat: (chat) => {
      dispatch({ type: ACTIONS.SET_CURRENT_CHAT, payload: chat });
    },
    
    sendMessage: async (chatId, text) => {
      const message = {
        id: Date.now().toString(),
        chatId,
        senderId: '1', // Current user
        text,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      
      dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message } });
      
      // TODO: Implement real-time messaging with Socket.IO
      // For now, simulate response
      setTimeout(() => {
        const responseMessage = {
          id: (Date.now() + 1).toString(),
          chatId,
          senderId: chatId === '1' ? '2' : '1',
          text: `Thanks for your message about "${text}"! I'll get back to you soon.`,
          timestamp: new Date().toISOString(),
          isRead: false
        };
        dispatch({ type: ACTIONS.ADD_MESSAGE, payload: { chatId, message: responseMessage } });
      }, 2000);
    },
    
    markMessageRead: (messageId) => {
      dispatch({ type: ACTIONS.MARK_MESSAGE_READ, payload: { messageId } });
    },
    
    updateUserStatus: (userId, status) => {
      dispatch({ type: ACTIONS.UPDATE_USER_STATUS, payload: { userId, status } });
    },
    
    clearError: () => {
      dispatch({ type: ACTIONS.SET_ERROR, payload: null });
    },

    // Refresh data from API
    refreshData: async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('skillswap_token');
      if (!token) {
        console.log('User not authenticated, skipping data refresh');
        return;
      }

      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      
      try {
        const [matchesResponse, conversationsResponse] = await Promise.all([
          apiService.getMatches(),
          apiService.getConversations()
        ]);
        
        // Extract users from matches response
        const users = matchesResponse.users || matchesResponse.matches || [];
        dispatch({ type: ACTIONS.SET_USERS, payload: users });
        dispatch({ type: ACTIONS.SET_MATCHES, payload: matchesResponse.matches || [] });
        dispatch({ type: ACTIONS.SET_CHATS, payload: conversationsResponse.conversations || [] });
      } catch (error) {
        console.error('Error refreshing data:', error);
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      } finally {
        dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      }
    }
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
