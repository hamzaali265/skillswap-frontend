import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreVertical, ArrowLeft, User, MessageCircle, Smile } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { formatDate, formatTime } from '../../utils/helpers';
import firebaseChatService from '../../services/firebaseChat';
import apiService from '../../services/api';

const ChatWindow = ({ chat, onBack, isMobile }) => {
  const { user: currentUser } = useAuth();
  const { sendMessage, markChatAsRead } = useApp();
  
  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loadingOtherUser, setLoadingOtherUser] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch current user profile
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      try {
        console.log('🔄 Fetching current user profile...');
        const response = await apiService.getProfile();
        if (response.data) {
          console.log('✅ Current user profile loaded:', response.data);
          setCurrentUserProfile(response.data);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch current user profile:', error.message);
      }
    };

    fetchCurrentUserProfile();
  }, []);

  // Get the other user in the chat
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!chat || !currentUser?.id) {
        setOtherUser(null);
        return;
      }

      const otherUserId = chat.members.find(id => id !== currentUser.id);
      if (!otherUserId) {
        setOtherUser(null);
        return;
      }

      setLoadingOtherUser(true);
      console.log('🔄 Fetching other user data for chat:', chat.id, 'user:', otherUserId);
      
      try {
        // Primary: Try to get user profile from API
        console.log('🔄 Attempting to fetch user profile from API...');
        const response = await apiService.getOtherUserProfile(otherUserId);
        if (response.data) {
          console.log('✅ Successfully fetched other user data from API:', response.data);
          setOtherUser({
            id: otherUserId,
            name: response.data.name || `User ${otherUserId.slice(0, 8)}`,
            avatar: response.data.avatar || '',
            bio: response.data.bio || '',
            location: response.data.location || '',
            skillsOffered: response.data.skillsOffered || [],
            skillsWanted: response.data.skillsWanted || [],
            status: response.data.isOnline ? 'online' : 'offline',
            averageRating: response.data.averageRating || 0,
            ratingCount: response.data.ratingCount || 0
          });
          return;
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch other user data from API:', error.message);
        
        // Fallback: try to get from matches
        try {
          console.log('🔄 Attempting to fetch user data from matches as fallback...');
          const matchesResponse = await apiService.getMatchesAlternative();
          if (matchesResponse.data) {
            const allUsers = matchesResponse.data.users || matchesResponse.data || [];
            const userData = allUsers.find(u => u.id === otherUserId);
            
            if (userData) {
              console.log('✅ Found other user data in matches:', userData);
              setOtherUser({
                id: otherUserId,
                name: userData.name || `User ${otherUserId.slice(0, 8)}`,
                avatar: userData.avatar || '',
                bio: userData.bio || '',
                location: userData.location || '',
                skillsOffered: userData.skillsOffered || [],
                skillsWanted: userData.skillsWanted || [],
                status: userData.isOnline ? 'online' : 'offline',
                averageRating: userData.averageRating || 0,
                ratingCount: userData.ratingCount || 0
              });
              return;
            }
          }
        } catch (matchesError) {
          console.warn('⚠️ Could not fetch other user data from matches either:', matchesError.message);
        }
      } finally {
        setLoadingOtherUser(false);
      }
      
      // Final fallback: use basic user data
      console.log('⚠️ Using fallback user data for:', otherUserId);
      setOtherUser({
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
      });
    };

    fetchOtherUser();
  }, [chat, currentUser?.id]);

  // Subscribe to messages
  useEffect(() => {
    if (!chat?.id) return;

    console.log('🔄 Subscribing to messages for chat:', chat.id);
    const unsubscribe = firebaseChatService.subscribeToMessages(chat.id, (newMessages) => {
      console.log('📨 Received messages update:', newMessages.length, 'messages');
      setMessages(newMessages);
    });

    return () => {
      if (unsubscribe) {
        console.log('🔄 Unsubscribing from messages for chat:', chat.id);
        unsubscribe();
      }
    };
  }, [chat?.id]);

  // Subscribe to chat updates (typing indicators)
  useEffect(() => {
    if (!chat?.id) return;

    console.log('🔄 Subscribing to chat updates for chat:', chat.id);
    const unsubscribe = firebaseChatService.subscribeToChat(chat.id, (chatData) => {
      if (chatData.typing && chatData.typing.userId !== currentUser?.id) {
        console.log('⌨️ Typing indicator update:', chatData.typing);
        setOtherUserTyping(chatData.typing.isTyping);
        
        // Hide typing indicator after 2 seconds
        if (chatData.typing.isTyping) {
          setTimeout(() => setOtherUserTyping(false), 2000);
        }
      }
    });

    return () => {
      if (unsubscribe) {
        console.log('🔄 Unsubscribing from chat updates for chat:', chat.id);
        unsubscribe();
      }
    };
  }, [chat?.id, currentUser?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (chat?.id && currentUser?.id) {
      console.log('🔄 Marking messages as read for chat:', chat.id);
      markChatAsRead(chat.id, currentUser.id);
    }
  }, [chat?.id, currentUser?.id, markChatAsRead]);

  // Handle typing
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (!chat?.id || !currentUser?.id) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing start
    firebaseChatService.sendTypingIndicator(chat.id, currentUser.id, true);

    // Set timeout to send typing stop
    typingTimeoutRef.current = setTimeout(() => {
      firebaseChatService.sendTypingIndicator(chat.id, currentUser.id, false);
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !chat?.id || !currentUser?.id) return;

    try {
      console.log('🔄 Sending message:', messageText.trim());
      await firebaseChatService.sendMessage(chat.id, currentUser.id, messageText.trim());
      setMessageText('');
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      firebaseChatService.sendTypingIndicator(chat.id, currentUser.id, false);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!chat || !otherUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 h-full">
        <div className="text-center text-gray-500 max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">
            {loadingOtherUser ? 'Loading conversation...' : 'Select a conversation'}
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {loadingOtherUser 
              ? 'Please wait while we load the conversation details...'
              : 'Choose a conversation from the sidebar to start chatting and building connections with your matches.'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <button
              onClick={onBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="relative">
            <Avatar
              src={otherUser.avatar}
              alt={otherUser.name}
              size="lg"
              fallback={otherUser.name}
              className="w-12 h-12"
            />
            {otherUser.status === 'online' && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {loadingOtherUser ? 'Loading...' : otherUser.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${otherUser.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <p className="text-sm text-gray-500">
                {otherUser.status === 'online' ? 'Online' : 'Offline'}
                {otherUser.location && ` • ${otherUser.location}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
            <Video className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 max-w-md mx-auto">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No messages yet</h3>
              <p className="text-gray-500">Start the conversation by sending your first message!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.senderId === currentUser?.id;
            const isRead = message.readBy?.includes(currentUser?.id) || isOwnMessage;
            const showAvatar = !isOwnMessage && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-3 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {showAvatar && (
                    <Avatar
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      size="sm"
                      fallback={otherUser.name}
                      className="w-8 h-8 flex-shrink-0"
                    />
                  )}
                  
                  {!isOwnMessage && !showAvatar && (
                    <div className="w-8 flex-shrink-0"></div>
                  )}
                  
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-sm ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                      }`}
                    >
                      <p className="text-sm break-words leading-relaxed">{message.text}</p>
                    </div>
                    
                    <div className={`flex items-center space-x-2 mt-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="text-xs text-gray-400">
                        {formatTime(message.createdAt)}
                      </span>
                      {isOwnMessage && (
                        <span className="text-xs text-gray-400">
                          {isRead ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="flex items-end space-x-3 max-w-xs lg:max-w-md">
              <Avatar
                src={otherUser.avatar}
                alt={otherUser.name}
                size="sm"
                fallback={otherUser.name}
                className="w-8 h-8 flex-shrink-0"
              />
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">
                  {otherUser.name} is typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                placeholder="Type a message..."
                value={messageText}
                onChange={handleTyping}
                onKeyPress={handleKeyPress}
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm resize-none"
                style={{ 
                  minHeight: '48px',
                  maxHeight: '120px'
                }}
              />
              <button
                type="button"
                className="absolute right-3 bottom-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!messageText.trim()}
            className="px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
