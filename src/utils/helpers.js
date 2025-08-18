// Date formatting utilities
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

// Match calculation utilities
export const calculateMatchPercentage = (user1, user2) => {
  if (!user1 || !user2) return 0;
  
  const user1Offered = (user1.skillsOffered || []).map(skill => skill.skillName || skill.name);
  const user1Wanted = (user1.skillsWanted || []).map(skill => skill.skillName || skill.name);
  const user2Offered = (user2.skillsOffered || []).map(skill => skill.skillName || skill.name);
  const user2Wanted = (user2.skillsWanted || []).map(skill => skill.skillName || skill.name);
  
  // Calculate mutual matches
  const user1CanHelpUser2 = user1Offered.filter(skill => user2Wanted.includes(skill));
  const user2CanHelpUser1 = user2Offered.filter(skill => user1Wanted.includes(skill));
  
  const totalMatches = user1CanHelpUser2.length + user2CanHelpUser1.length;
  const maxPossibleMatches = Math.max(user1Offered.length + user2Offered.length, 1);
  
  return Math.round((totalMatches / maxPossibleMatches) * 100);
};

export const getCommonSkills = (user1, user2) => {
  if (!user1 || !user2) return [];
  
  const user1Offered = (user1.skillsOffered || []).map(skill => skill.skillName || skill.name);
  const user1Wanted = (user1.skillsWanted || []).map(skill => skill.skillName || skill.name);
  const user2Offered = (user2.skillsOffered || []).map(skill => skill.skillName || skill.name);
  const user2Wanted = (user2.skillsWanted || []).map(skill => skill.skillName || skill.name);
  
  const user1CanHelpUser2 = user1Offered.filter(skill => user2Wanted.includes(skill));
  const user2CanHelpUser1 = user2Offered.filter(skill => user1Wanted.includes(skill));
  
  return [...new Set([...user1CanHelpUser2, ...user2CanHelpUser1])];
};

// Validation utilities
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || 'Please enter a valid email';
};

export const validatePassword = (password) => {
  return password.length >= 6 || 'Password must be at least 6 characters';
};

// Local storage utilities
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    // Check if item exists and is not the string "undefined"
    if (item && item !== 'undefined' && item !== 'null') {
      return JSON.parse(item);
    }
    return defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Clear corrupted localStorage data
export const clearCorruptedLocalStorage = () => {
  try {
    const keys = ['skillswap_user', 'skillswap_token'];
    keys.forEach(key => {
      const item = localStorage.getItem(key);
      if (item === 'undefined' || item === 'null' || item === '') {
        localStorage.removeItem(key);
        console.log(`Cleared corrupted localStorage key: ${key}`);
      }
    });
  } catch (error) {
    console.error('Error clearing corrupted localStorage:', error);
  }
};

// Mock API utilities
export const simulateApiCall = (data, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const simulateApiError = (message = 'Something went wrong', delay = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error(message));
    }, delay);
  });
};

// Search and filter utilities
export const filterUsersBySkills = (users, searchTerm) => {
  if (!searchTerm) return users;
  
  const term = searchTerm.toLowerCase();
  return users.filter(user => {
    const allSkills = [
      ...user.skillsOffered.map(s => s.name.toLowerCase()),
      ...user.skillsWanted.map(s => s.name.toLowerCase())
    ];
    
    return allSkills.some(skill => skill.includes(term)) ||
           user.name.toLowerCase().includes(term) ||
           user.bio.toLowerCase().includes(term);
  });
};

export const sortUsersByMatchPercentage = (users, currentUser) => {
  return users
    .map(user => ({
      ...user,
      matchPercentage: calculateMatchPercentage(currentUser, user)
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
};

// Skill level utilities
export const getSkillLevelColor = (level) => {
  switch (level) {
    case 'beginner':
      return 'text-green-600 bg-green-50';
    case 'intermediate':
      return 'text-blue-600 bg-blue-50';
    case 'advanced':
      return 'text-purple-600 bg-purple-50';
    case 'expert':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getSkillLevelLabel = (level) => {
  switch (level) {
    case 'beginner':
      return 'Beginner';
    case 'intermediate':
      return 'Intermediate';
    case 'advanced':
      return 'Advanced';
    case 'expert':
      return 'Expert';
    default:
      return 'Unknown';
  }
};

// Status utilities
export const getStatusColor = (status) => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
