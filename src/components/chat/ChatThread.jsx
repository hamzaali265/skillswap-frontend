import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, MoreVertical } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';
import { formatDate } from '../../utils/helpers';
import apiService from '../../services/api';

const ChatThread = ({ onChatSelect, selectedChatId, isMobile, onMobileBack }) => {
  const { chats, loading } = useApp();
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [chatUsers, setChatUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  // Fetch user profiles for all chats
  useEffect(() => {
    const fetchChatUsers = async () => {
      if (!chats.length) return;

      try {
        console.log('🔄 Fetching user data for chats...');
        
        // Get unique user IDs from all chats
        const userIds = new Set();
        chats.forEach(chat => {
          if (chat.members) {
            chat.members.forEach(memberId => {
              if (memberId !== currentUser?.id) {
                userIds.add(memberId);
              }
            });
          }
        });

        const uniqueUserIds = Array.from(userIds);
        console.log('📋 Unique user IDs to fetch:', uniqueUserIds);

        // Fetch user data for each unique user ID
        const userDataPromises = uniqueUserIds.map(async (userId) => {
          try {
            setLoadingUsers(prev => ({ ...prev, [userId]: true }));
            
            // Try to get user profile from API
            const response = await apiService.getOtherUserProfile(userId);
            if (response.data) {
              console.log('✅ Fetched user data for:', userId, response.data);
              return { id: userId, ...response.data };
            }
          } catch (error) {
            console.warn(`⚠️ Could not fetch user data for ${userId}:`, error.message);
            
            // Fallback: try to get from matches
            try {
              const matchesResponse = await apiService.getMatchesAlternative();
              if (matchesResponse.data) {
                const allUsers = matchesResponse.data.users || matchesResponse.data || [];
                const userData = allUsers.find(u => u.id === userId);
                if (userData) {
                  console.log('✅ Found user data in matches for:', userId, userData);
                  return { id: userId, ...userData };
                }
              }
            } catch (matchesError) {
              console.warn(`⚠️ Could not find user ${userId} in matches either:`, matchesError.message);
            }
          } finally {
            setLoadingUsers(prev => ({ ...prev, [userId]: false }));
          }
          
          // Return fallback data
          return {
            id: userId,
            name: `User ${userId.slice(0, 8)}`,
            avatar: '',
            bio: '',
            location: '',
            skillsOffered: [],
            skillsWanted: [],
            isOnline: false,
            averageRating: 0,
            ratingCount: 0
          };
        });

        const userDataResults = await Promise.all(userDataPromises);
        
        // Create a map of user data
        const usersMap = {};
        userDataResults.forEach(userData => {
          if (userData) {
            usersMap[userData.id] = userData;
          }
        });
        
        setChatUsers(usersMap);
        console.log('✅ All user data loaded:', usersMap);
        
      } catch (error) {
        console.error('❌ Error fetching chat users:', error);
      }
    };

    fetchChatUsers();
  }, [chats, currentUser?.id]);

  // Get the other user in the chat (not the current user)
  const getOtherUser = (chat) => {
    if (!currentUser?.id || !chat.members) return null;
    
    const otherUserId = chat.members.find(id => id !== currentUser.id);
    if (!otherUserId) return null;
    
    const userData = chatUsers[otherUserId];
    const isLoading = loadingUsers[otherUserId];
    
    if (isLoading) {
      return {
        id: otherUserId,
        name: 'Loading...',
        avatar: '',
        bio: '',
        location: '',
        skillsOffered: [],
        skillsWanted: [],
        status: 'offline',
        averageRating: 0,
        ratingCount: 0,
        isLoading: true
      };
    }
    
    if (!userData) {
      return {
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
      };
    }
    
    return {
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
    };
  };

  // Get last message text
  const getLastMessageText = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage;
    }
    return 'Start a conversation';
  };

  // Get last message time
  const getLastMessageTime = (chat) => {
    if (chat.lastMessageTime) {
      const timestamp = chat.lastMessageTime?.toDate?.() || chat.lastMessageTime;
      return formatDate(timestamp);
    }
    return '';
  };

  // Get unread count for current user
  const getUnreadCount = (chat) => {
    if (!currentUser?.id || !chat.unreadCounts) return 0;
    return chat.unreadCounts[currentUser.id] || 0;
  };

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => {
    const otherUser = getOtherUser(chat);
    if (!otherUser) return false;
    
    return otherUser.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="animate-pulse">
            <div className="h-7 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b border-gray-50">
              <div className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm h-full ${isMobile && selectedChatId ? 'hidden' : 'block'}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
            </p>
          </div>
          {isMobile && (
            <button
              onClick={onMobileBack}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              {!searchTerm 
                ? 'Start chatting with your matches to build connections!'
                : 'Try adjusting your search terms'
              }
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredChats.map((chat) => {
              const otherUser = getOtherUser(chat);
              const unreadCount = getUnreadCount(chat);
              const isSelected = selectedChatId === chat.id;
              
              if (!otherUser) return null;

              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                    isSelected 
                      ? 'bg-blue-50 border border-blue-200 shadow-sm' 
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
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

                    {/* Chat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {otherUser.isLoading ? (
                              <span className="text-gray-400">Loading...</span>
                            ) : (
                              otherUser.name
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {otherUser.location && `${otherUser.location} • `}
                            {otherUser.status === 'online' ? 'Online' : 'Offline'}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-400">
                            {getLastMessageTime(chat)}
                          </span>
                          
                          {unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full min-w-[20px]">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 truncate">
                          {getLastMessageText(chat)}
                        </p>
                      </div>
                    </div>

                    {/* More options button */}
                    <button className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
