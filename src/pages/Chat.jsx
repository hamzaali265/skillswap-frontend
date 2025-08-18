import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, MoreVertical, Phone, Video } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Input from '../components/ui/Input';
import { formatDate, formatTime } from '../utils/helpers';

const Chat = () => {
  const { user } = useAuth();
  const { 
    chats, 
    currentChat, 
    setCurrentChat, 
    sendMessage, 
    getCurrentChatMessages,
    loading 
  } = useApp();
  
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [getCurrentChatMessages()]);

  const filteredChats = chats.filter(chat =>
    chat.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !currentChat) return;

    sendMessage(currentChat.id, messageText);
    setMessageText('');
  };

  const handleChatSelect = (chat) => {
    setCurrentChat(chat);
    if (isMobile) {
      // In mobile view, we might want to hide the chat list
      // This could be implemented with a state to show/hide the list
    }
  };

  const messages = getCurrentChatMessages();

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
        <div className="p-4 border-b border-gray-200">
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
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentChat(null)}
                    className="md:hidden"
                  >
                    ←
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
                  <p className="text-sm text-gray-500">
                    {currentChat.user.status === 'online' ? 'Online' : 'Offline'}
                  </p>
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

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === user?.id;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-primary-500 text-white rounded-tr-md'
                              : 'bg-gray-100 text-gray-800 rounded-tl-md'
                          }`}
                        >
                          <p className="text-sm">{message.text}</p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                      {!isOwnMessage && (
                        <div className="order-2 ml-2">
                          <Avatar 
                            src={currentChat.user.avatar} 
                            alt={currentChat.user.name} 
                            size="sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-gray-600">
                    Send a message to begin chatting with {currentChat.user.name}
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!messageText.trim()}
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
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
