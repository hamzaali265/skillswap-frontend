import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useRatedUsers = (users) => {
  const [ratedUsers, setRatedUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    const checkRatedUsers = async () => {
      if (!users || users.length === 0 || !user) return;
      
      const alreadyRated = new Set();
      
      try {
        // Import apiService dynamically to avoid circular imports
        const apiService = (await import('../services/api')).default;
        
        // Check each user to see if current user has rated them
        for (const otherUser of users) {
          if (otherUser.id === user.id) continue; // Skip self
          
          try {
            const response = await apiService.getUserRating(otherUser.id);
            
            // If there's a rating response, user has rated this person
            if (response && response.data && response.data.userRating !== null && response.data.userRating > 0) {
              alreadyRated.add(otherUser.id);
            }
          } catch (error) {
            // If 404 or no rating found, user hasn't rated this person
          }
        }
        
        setRatedUsers(alreadyRated);
      } catch (error) {
        console.error('useRatedUsers: Error checking rated users:', error);
      }
    };
    
    checkRatedUsers();
  }, [users, user]);

  const addRatedUser = (userId) => {
    setRatedUsers(prev => new Set([...prev, userId]));
  };

  const removeRatedUser = (userId) => {
    setRatedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  return {
    ratedUsers,
    addRatedUser,
    removeRatedUser,
    hasRated: (userId) => ratedUsers.has(userId)
  };
};
