import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import { formatDate, formatTime } from '../utils/helpers';
import apiService from '../services/api';
import supabaseChatService from '../services/supabaseChat';

const Chat = () => {
  const { user } = useAuth();
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { 
    chats, 
    matches,
    currentChat, 
    setCurrentChat, 
    sendMessage, 
    loadChatHistory,
    markChatAsRead,
    createConversation,
    getCurrentChatMessages,
    loading
  } = useApp();
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const typingTimeoutRef = useRef(null);

  // Get messages safely - declare early to avoid initialization issues
  const messages = getCurrentChatMessages ? getCurrentChatMessages() : [];

  // Handle typing indicators
  useEffect(() => {
    if (currentChat?.user?.id) {
      // Subscribe to messages for this chat
      const handleNewMessage = (message) => {
        console.log('📨 New message in chat:', message);
        // The message will be handled by the AppContext subscription
      };

      const handleMessageUpdate = (update) => {
        console.log('📨 Message updated in chat:', update);
        if (update.type === 'update') {
          // Handle message updates (e.g., read receipts)
          // This could update the message read status
        }
      };

      // Subscribe to messages for this specific chat
      supabaseChatService.subscribeToMessages(currentChat.id, (data) => {
        if (data.type === 'update') {
          handleMessageUpdate(data);
        } else {
          handleNewMessage(data);
        }
      });

      return () => {
        // Unsubscribe when chat changes
        supabaseChatService.unsubscribe(currentChat.id);
        // Clear typing timeout on cleanup
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [currentChat?.id]);

  // Send typing indicators
  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (currentChat?.user?.id) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing start
      apiService.sendTypingIndicator(currentChat.user.id, true);

      // Set timeout to send typing stop
      typingTimeoutRef.current = setTimeout(() => {
        apiService.sendTypingIndicator(currentChat.user.id, false);
      }, 2000);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages.length, currentChat?.id]);

  // Load chat history when a chat is selected
  useEffect(() => {
    if (currentChat && currentChat.user?.id) {
      loadChatHistory(currentChat.user.id);
      markChatAsRead(currentChat.user.id);
    }
  }, [currentChat?.id, loadChatHistory, markChatAsRead]);

  // Handle case when chats are not loaded yet but we have a targetUserId
  useEffect(() => {
    if (targetUserId && chats.length === 0 && !loading) {
      console.log('Chat component - No chats loaded yet, waiting for data...');
    }
  }, [targetUserId, chats.length, loading]);

  // Handle navigation from user card (e.g., /chat/123)
  useEffect(() => {
    if (!targetUserId || chats.length === 0) return;
    
    console.log('Chat component - targetUserId:', targetUserId);
    console.log('Chat component - chats:', chats);
    console.log('Chat component - matches:', matches);
    
    const handleChatNavigation = async () => {
      // Find existing chat with this user
      const existingChat = chats.find(chat => chat.user.id === targetUserId);
      console.log('Chat component - existingChat:', existingChat);
      
      if (existingChat) {
        console.log('Chat component - Setting existing chat');
        setCurrentChat(existingChat);
        // Load chat history and mark as read
        loadChatHistory(targetUserId);
        markChatAsRead(targetUserId);
      } else {
        console.log('Chat component - Creating new chat');
        try {
          // Try to find user data from matches to create a proper chat
          const userData = matches.find(match => match.id === targetUserId);
          console.log('Chat component - userData from matches:', userData);
          
          if (userData) {
            // Create a new chat with proper user data
            const newChat = await createConversation(targetUserId, userData);
            console.log('Chat component - Created new chat with user data:', newChat);
            setCurrentChat(newChat);
          } else {
            // Fallback: create a basic chat entry
            const newChat = await createConversation(targetUserId, {
              name: 'User',
              avatar: '',
              isOnline: false
            });
            console.log('Chat component - Created fallback chat:', newChat);
            setCurrentChat(newChat);
          }
          
          // Load empty chat history for new conversation
          loadChatHistory(targetUserId);
        } catch (error) {
          console.error('❌ Error creating chat:', error);
        }
      }
    };
    
    handleChatNavigation();
  }, [targetUserId, chats.length, matches.length, createConversation, loadChatHistory, markChatAsRead]);

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat) return;

    // Use the chat ID for consistency
    const chatId = currentChat.id;
    sendMessage(chatId, messageText);
    setMessageText('');
    
    // Show typing indicator briefly
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    if (isMobile) {
      // In mobile view, we might want to hide the chat list
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = new Date(message.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Chat List Sidebar */}
      <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${isMobile && currentChat ? 'hidden' : 'block'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          <Input
            placeholder="Search conversations..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  currentChat?.id === chat.id ? 'bg-primary-50 border-primary-200' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar 
                      src={chat.user.avatar} 
                      alt={chat.user.name} 
                      size="md" 
                      status={chat.user.status}
                    />
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {formatDate(chat.lastMessage.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {chat.lastMessage.text}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-600">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className={`flex-1 flex flex-col ${isMobile && !currentChat ? 'hidden' : 'block'}`}>
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCurrentChat(null);
                      if (targetUserId) {
                        navigate('/chat');
                      }
                    }}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Avatar 
                  src={currentChat.user.avatar} 
                  alt={currentChat.user.name} 
                  size="md" 
                  status={currentChat.user.status}
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {currentChat.user.name}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{currentChat.user.status === 'online' ? 'Online' : 'Offline'}</span>
                    {currentChat.user.location && (
                      <>
                        <span>•</span>
                        <span>{currentChat.user.location}</span>
                      </>
                    )}
                    {currentChat.user.averageRating > 0 && (
                      <>
                        <span>•</span>
                        <span>⭐ {currentChat.user.averageRating.toFixed(1)} ({currentChat.user.ratingCount})</span>
                      </>
                    )}
                  </div>
                  {currentChat.user.bio && (
                    <p className="text-xs text-gray-600 mt-1 truncate max-w-xs">
                      {currentChat.user.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 flex">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {Object.entries(messageGroups).map(([date, messages]) => (
                  <div key={date} className="space-y-2">
                    <div className="text-xs text-gray-500 text-center px-2 py-1">
                      {date}
                    </div>
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isOwnMessage && (
                            <div className="flex-shrink-0 mr-2">
                              <Avatar 
                                src={currentChat.user.avatar} 
                                alt={currentChat.user.name} 
                                size="sm"
                              />
                            </div>
                          )}
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'ml-auto' : ''}`}>
                            <div
                              className={`px-4 py-3 rounded-2xl shadow-sm ${
                                isOwnMessage
                                  ? 'bg-primary-500 text-white rounded-br-md'
                                  : 'bg-white text-gray-800 rounded-bl-md border border-gray-200'
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                            </div>
                            <div className={`flex items-center mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                              <p className="text-xs text-gray-500">
                                {formatTime(message.timestamp)}
                              </p>
                              {isOwnMessage && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {message.isRead ? '✓✓' : '✓'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-600">Send a message to begin chatting with {currentChat.user.name}</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* User Profile Sidebar */}
              <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="text-center">
                    <Avatar 
                      src={currentChat.user.avatar} 
                      alt={currentChat.user.name} 
                      size="xl" 
                      className="mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentChat.user.name}</h3>
                    {currentChat.user.bio && (
                      <p className="text-gray-600 text-sm mb-3">{currentChat.user.bio}</p>
                    )}
                    {currentChat.user.location && (
                      <p className="text-gray-500 text-sm mb-3">{currentChat.user.location}</p>
                    )}
                    {currentChat.user.averageRating > 0 && (
                      <div className="flex items-center justify-center space-x-1 mb-3">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm font-medium">{currentChat.user.averageRating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500">({currentChat.user.ratingCount} reviews)</span>
                      </div>
                    )}
                  </div>

                  {/* Skills Offered */}
                  {currentChat.user.skillsOffered && currentChat.user.skillsOffered.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Skills I Can Offer</h4>
                      <div className="space-y-2">
                        {currentChat.user.skillsOffered.map((skill) => (
                          <div key={skill.id || skill.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{skill.skillName || skill.name}</span>
                            {skill.proficiencyLevel && (
                              <span className="text-xs text-gray-500 capitalize">{skill.proficiencyLevel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Wanted */}
                  {currentChat.user.skillsWanted && currentChat.user.skillsWanted.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Skills I Want to Learn</h4>
                      <div className="space-y-2">
                        {currentChat.user.skillsWanted.map((skill) => (
                          <div key={skill.id || skill.name} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium">{skill.skillName || skill.name}</span>
                            {skill.urgencyLevel && (
                              <span className="text-xs text-gray-500 capitalize">{skill.urgencyLevel}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/profile/${currentChat.user.id}`)}
                    >
                      View Full Profile
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        // Handle rating functionality
                        console.log('Rate user:', currentChat.user.id);
                      }}
                    >
                      Rate User
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={handleTyping}
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Typing Indicators */}
            {isTyping && (
              <div className="px-4 pb-2">
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="px-4 py-3 rounded-2xl shadow-sm bg-gray-100 text-gray-800 rounded-br-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {otherUserTyping && (
              <div className="px-4 pb-2">
                <div className="flex justify-start">
                  <div className="flex-shrink-0 mr-2">
                    <Avatar 
                      src={currentChat.user.avatar} 
                      alt={currentChat.user.name} 
                      size="sm"
                    />
                  </div>
                  <div className="max-w-xs lg:max-w-md">
                    <div className="px-4 py-3 rounded-2xl shadow-sm bg-white text-gray-800 rounded-bl-md border border-gray-200">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a chat from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
