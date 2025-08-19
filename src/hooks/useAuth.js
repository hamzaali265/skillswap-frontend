import { useState, useEffect, useCallback } from 'react';
import {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearCorruptedLocalStorage,
} from '../utils/helpers';
import apiService from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage and verify token
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        clearCorruptedLocalStorage();

        const savedUser = getLocalStorage('skillswap_user');
        const token = localStorage.getItem('skillswap_token'); // raw fetch

        console.log('initializeAuth - savedUser:', savedUser);
        console.log('initializeAuth - token from localStorage:', token);

        if (savedUser && token) {
          try {
            console.log('initializeAuth - verifying token and fetching fresh user data...');
            const response = await apiService.verifyToken();
            console.log('initializeAuth - verifyToken response:', response);
            
            // Use user data from verifyToken response if available
            if (response.data && response.data.user) {
              console.log('initializeAuth - using user data from verifyToken:', response.data.user);
              setUser(response.data.user);
              setLocalStorage('skillswap_user', response.data.user);
            } else if (response.data) {
              // If verifyToken returns user data directly
              console.log('initializeAuth - using data from verifyToken:', response.data);
              setUser(response.data);
              setLocalStorage('skillswap_user', response.data);
            } else {
              // Fallback: try to get profile separately
              try {
                console.log('initializeAuth - fetching fresh user profile...');
                const profileResponse = await apiService.getProfile();
                console.log('initializeAuth - getProfile response:', profileResponse);
                
                if (profileResponse.data) {
                  console.log('initializeAuth - setting fresh user data:', profileResponse.data);
                  setUser(profileResponse.data);
                  setLocalStorage('skillswap_user', profileResponse.data);
                } else {
                  console.error('initializeAuth - no data in profile response');
                  removeLocalStorage('skillswap_user');
                  removeLocalStorage('skillswap_token');
                  setUser(null);
                }
              } catch (profileError) {
                console.warn('initializeAuth - getProfile failed, using saved user data:', profileError.message);
                // Use saved user data if getProfile fails
                setUser(savedUser);
              }
            }
          } catch (err) {
            console.error('initializeAuth - verifyToken error:', err);
            removeLocalStorage('skillswap_user');
            removeLocalStorage('skillswap_token');
            setUser(null);
          }
        } else {
          console.log('initializeAuth - no saved user or token found');
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    console.log('useAuth login called with:', { email, password });
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.login({ email, password });
      console.log('API login response:', response);

      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;

      console.log('Extracted user:', user);
      console.log('Extracted token:', token);

      setUser(user);

      // ✅ Always store raw values (no JSON.stringify for token)
      setLocalStorage('skillswap_user', user);
      localStorage.setItem('skillswap_token', token);

      console.log('Login successful, localStorage check:', {
        user: localStorage.getItem('skillswap_user'),
        token: localStorage.getItem('skillswap_token'),
      });

      return user;
    } catch (err) {
      console.error('Login error in useAuth:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
  
    try {
      // formData is already FormData (avatar, bio, etc.)
      const response = await apiService.register(formData);
  
      console.log('API register response:', response);
  
      const user = response.data?.user || response.user;
      const token = response.data?.token || response.token;
  
      setUser(user);
  
      // ✅ Always store raw values
      setLocalStorage('skillswap_user', user);
      localStorage.setItem('skillswap_token', token);
  
      return user;
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  

  // Logout function
  const logout = useCallback(async () => {
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      removeLocalStorage('skillswap_user');
      removeLocalStorage('skillswap_token');
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(
    async (updates) => {
      if (!user) return;

      console.log('updateProfile called with:', updates);
      console.log('Current user state:', user);

      setLoading(true);
      setError(null);

      try {
        // Check if updates is a full user object (from getProfile) or partial updates
        if (updates.id && updates.skillsOffered !== undefined) {
          console.log('Detected full user object, updating directly');
          // This is a full user object from getProfile
          setUser(updates);
          setLocalStorage('skillswap_user', updates);
          console.log('User state updated with full object');
          return updates;
        } else {
          console.log('Detected partial updates, calling API');
          // This is partial updates, call the API
          const response = await apiService.updateProfile(updates);
          const updatedUser = { ...user, ...response.user };

          setUser(updatedUser);
          setLocalStorage('skillswap_user', updatedUser);
          console.log('User state updated with partial updates');

          return updatedUser;
        }
      } catch (err) {
        console.error('updateProfile error:', err);
        setError(err.message || 'Profile update failed');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('skillswap_token');
    return !!user && !!token;
  }, [user]);

  // Refresh user data from API
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('refreshUserData - fetching fresh user profile...');
      const profileResponse = await apiService.getProfile();
      console.log('refreshUserData - getProfile response:', profileResponse);
      
      if (profileResponse.data) {
        console.log('refreshUserData - updating user with fresh data:', profileResponse.data);
        setUser(profileResponse.data);
        setLocalStorage('skillswap_user', profileResponse.data);
        return profileResponse.data;
      } else {
        console.error('refreshUserData - no data in profile response');
      }
    } catch (error) {
      console.error('refreshUserData - error:', error);
      throw error;
    }
  }, [user]);

  console.log('useAuth state - user:', user, 'loading:', loading);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    refreshUserData,
    isAuthenticated: isAuthenticated(),
  };
};
