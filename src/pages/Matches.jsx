import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, MessageCircle, MapPin, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useRatedUsers } from '../hooks/useRatedUsers';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import RatingDialog from '../components/ui/RatingDialog';
import UserCard from '../components/ui/UserCard';
import Input from '../components/ui/Input';
import { getCommonSkills, formatDate } from '../utils/helpers';

const Matches = () => {
  const { user } = useAuth();
  const { filteredUsers, loading, setSearchQuery, setFilters, filters, refreshData, handleMessageButtonClick } = useApp();
  const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const { ratedUsers, addRatedUser } = useRatedUsers(filteredUsers);
  const navigate = useNavigate();




  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchQuery(value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters({ [filterType]: value });
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh matches:', error);
    }
  };

  const handleRating = async (rating, comment = '') => {
    try {
      if (!selectedUser) return;
      
      
      
      // Check if user is authenticated
      if (!user || !localStorage.getItem('skillswap_token')) {
        alert('Please log in to rate users');
        return;
      }
      
      // Check if user is trying to rate themselves
      if (user.id === selectedUser.id) {
        alert('You cannot rate your own profile');
        return;
      }
      
      // Validate rating value
      if (rating < 1 || rating > 5) {
        alert('Please provide a valid rating between 1 and 5');
        return;
      }
      
      // Import apiService dynamically to avoid circular imports
      const apiService = (await import('../services/api')).default;
      const response = await apiService.submitRating(selectedUser.id, rating, comment);
      
      if (response.data) {
        alert('Rating submitted successfully!');
        setShowRatingDialog(false);
        setSelectedUser(null);
        setUserRating(0);
        
        // Add user to rated users set
        addRatedUser(selectedUser.id);
        
        // Refresh data to update ratings
        await refreshData();
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again later.');
    }
  };

  const handleMessage = async (userId) => {
    try {
      // Find user data for the chat
      const userData = filteredUsers.find(user => user.id === userId);
      
      if (!userData) {
        console.error('User not found for chat creation');
        return;
      }
      
      // Use the new handleMessageButtonClick function
      await handleMessageButtonClick(userId, userData, navigate);
    } catch (error) {
      console.error('Error handling message button click:', error);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleRateUser = (user) => {
    setSelectedUser(user);
    setUserRating(0);
    setShowRatingDialog(true);
  };

  // Ensure users have required properties
  const processedUsers = filteredUsers.map(otherUser => ({
    ...otherUser,
    skillsOffered: otherUser.skillsOffered || [],
    skillsWanted: otherUser.skillsWanted || [],
    bio: otherUser.bio || '',
    location: otherUser.location || 'No location',
    avatar: otherUser.avatar || '',
    name: otherUser.name || 'Unknown User',
    matchPercentage: otherUser.matchPercentage || 0
  }));

  // Remove local calculation functions since we're using API-provided matchPercentage
  // const getMatchPercentage = (otherUser) => {
  //   if (!user || !otherUser) return 0;
  //   return calculateMatchPercentage(user, otherUser);
  // };

  // const getCommonSkillsForUser = (otherUser) => {
  //   if (!user || !otherUser) return [];
  //   return getCommonSkills(user, otherUser);
  // };

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find Matches</h1>
          <p className="mt-2 text-gray-600">
            Discover developers with complementary skills
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by name, skills, or location..."
              icon={Search}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div>
            <select
              value={filters.skillLevel}
              onChange={(e) => handleFilterChange('skillLevel', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {processedUsers.length} {processedUsers.length === 1 ? 'match' : 'matches'} found
        </p>
      </div>

      {/* Users Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedUsers.map((otherUser) => (
            <UserCard
              key={otherUser.id}
              user={otherUser}
              currentUser={user}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
              onRateUser={handleRateUser}
              ratedUsers={ratedUsers}
              showSkills={true}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {processedUsers.map((otherUser) => (
            <UserCard
              key={otherUser.id}
              user={otherUser}
              currentUser={user}
              onMessage={handleMessage}
              onViewProfile={handleViewProfile}
              onRateUser={handleRateUser}
              ratedUsers={ratedUsers}
              showSkills={true}
              variant="list"
            />
          ))}
        </div>
      )}

      {processedUsers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
        </Card>
      )}

      {/* Rating Dialog */}
      <RatingDialog
        isOpen={showRatingDialog}
        onClose={() => {
          setShowRatingDialog(false);
          setSelectedUser(null);
          setUserRating(0);
        }}
        onSubmit={handleRating}
        userRating={userRating}
        userName={selectedUser?.name || 'User'}
        onRatingChange={setUserRating}
      />
    </div>
  );
};

export default Matches;
