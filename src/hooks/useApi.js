import { useState, useCallback } from 'react';
import { simulateApiCall, simulateApiError } from '../utils/helpers';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err.message || 'API call failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    apiCall,
    clearError
  };
};

// Mock API functions
export const mockApi = {
  // User related APIs
  getUsers: () => simulateApiCall(require('../types').mockUsers),
  getUser: (id) => simulateApiCall(require('../types').mockUsers.find(u => u.id === id)),
  updateUser: (id, updates) => simulateApiCall({ id, ...updates }),
  
  // Match related APIs
  getMatches: () => simulateApiCall(require('../types').mockMatches),
  getMatch: (id) => simulateApiCall(require('../types').mockMatches.find(m => m.id === id)),
  
  // Chat related APIs
  getChats: () => simulateApiCall(require('../types').mockChats),
  getChatMessages: (chatId) => simulateApiCall(
    require('../types').mockMessages.filter(m => m.chatId === chatId)
  ),
  sendMessage: (chatId, message) => simulateApiCall({
    id: Date.now().toString(),
    chatId,
    senderId: '1', // Current user
    text: message,
    timestamp: new Date().toISOString(),
    isRead: false
  }),
  
  // Skills related APIs
  getAvailableSkills: () => simulateApiCall(require('../types').availableSkills),
  
  // Search APIs
  searchUsers: (query) => {
    const users = require('../types').mockUsers;
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.skillsOffered.some(skill => skill.name.toLowerCase().includes(query.toLowerCase())) ||
      user.skillsWanted.some(skill => skill.name.toLowerCase().includes(query.toLowerCase()))
    );
    return simulateApiCall(filtered);
  }
};
