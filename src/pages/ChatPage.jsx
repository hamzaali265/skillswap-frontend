import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import ChatThread from '../components/chat/ChatThread';
import ChatWindow from '../components/chat/ChatWindow';
import apiService from '../services/api';
import firebaseChatService from '../services/firebaseChat';

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { 
    chats, 
    currentChat, 
    setCurrentChat, 
    loading, 
    handleMessageButtonClick,
    refreshData
  } = useApp();
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set current user in Firebase chat service
  useEffect(() => {
    if (currentUser) {
      firebaseChatService.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  // Load chats and handle navigation
  useEffect(() => {
    const initializeChats = async () => {
      try {
        console.log('🔄 Initializing chats...');
        setIsInitializing(true);
        await refreshData();
        
        // If we have a targetUserId from URL, handle it
        if (targetUserId) {
          console.log('🔄 Target user ID from URL:', targetUserId);
          await handleChatNavigation(targetUserId);
        }
      } catch (error) {
        console.error('❌ Error initializing chats:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChats();
  }, [targetUserId, refreshData]);

  // Handle chat navigation from URL or message button
  const handleChatNavigation = async (userId) => {
    try {
      console.log('🔄 Handling chat navigation for user:', userId);
      
      // First, check if we already have a current chat for this user
      if (currentChat && currentChat.members && currentChat.members.includes(userId)) {
        console.log('✅ Current chat is already for this user');
        setSelectedChatId(currentChat.id);
        return currentChat;
      }
      
      // Find existing chat with this user in our loaded chats
      const existingChat = chats.find(chat => {
        return chat.members && chat.members.includes(userId);
      });

      if (existingChat) {
        console.log('✅ Found existing chat:', existingChat);
        setCurrentChat(existingChat);
        setSelectedChatId(existingChat.id);
        return existingChat;
      }

      // Chat doesn't exist, create it using handleMessageButtonClick
      console.log('🔄 Creating new chat for user:', userId);
      
      // Try to get user data from matches first
      let userData = null;
      try {
        const matchesResponse = await apiService.getMatchesAlternative();
        if (matchesResponse.data) {
          const allUsers = matchesResponse.data.users || matchesResponse.data || [];
          userData = allUsers.find(u => u.id === userId);
          console.log('✅ Found user data in matches:', userData);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch user data from matches:', error.message);
      }

      // Create chat with user data using the handleMessageButtonClick function
      const newChat = await handleMessageButtonClick(userId, userData, navigate);
      if (newChat) {
        setSelectedChatId(newChat.id);
        console.log('✅ Chat created and selected successfully');
      }
      
    } catch (error) {
      console.error('❌ Error handling chat navigation:', error);
    }
  };

  // Handle chat selection from list
  const handleChatSelect = (chat) => {
    console.log('🔄 Chat selected from list:', chat);
    setCurrentChat(chat);
    setSelectedChatId(chat.id);
  };

  // Handle mobile back button
  const handleMobileBack = () => {
    setSelectedChatId(null);
    setCurrentChat(null);
  };

  // Update selected chat when currentChat changes
  useEffect(() => {
    if (currentChat && currentChat.id !== selectedChatId) {
      console.log('🔄 Updating selected chat ID to match current chat');
      setSelectedChatId(currentChat.id);
    }
  }, [currentChat, selectedChatId]);

  if (isInitializing) {
    return (
      <div className="flex h-[90vh] bg-gray-50 rounded-xl overflow-hidden shadow-lg mx-4 my-4 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[90vh] bg-gray-50 rounded-xl overflow-hidden shadow-lg mx-4 my-4">
      {/* Chat Thread (Inbox) */}
      <ChatThread
        onChatSelect={handleChatSelect}
        selectedChatId={selectedChatId}
        isMobile={isMobile}
        onMobileBack={handleMobileBack}
      />

      {/* Chat Window */}
      <ChatWindow
        chat={currentChat}
        onBack={handleMobileBack}
        isMobile={isMobile}
      />
    </div>
  );
};

export default ChatPage;
