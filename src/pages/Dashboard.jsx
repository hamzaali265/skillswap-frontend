import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageCircle, 
  Star, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Calendar,
  MapPin,
  Edit
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../contexts/AppContext';
import { useRatedUsers } from '../hooks/useRatedUsers';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import RatingDialog from '../components/ui/RatingDialog';
import UserCard from '../components/ui/UserCard';
import { formatDate } from '../utils/helpers';
import { getCommonSkills } from '../utils/helpers';

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const { currentUser: appUser, matches, chats, loading, handleMessageButtonClick } = useApp();
  
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [refreshedUser, setRefreshedUser] = useState(null);
  const { ratedUsers, addRatedUser } = useRatedUsers(matches);
  const navigate = useNavigate();

  // Use the most current user data (prefer refreshedUser, then appUser, then authUser)
  const user = refreshedUser || appUser || authUser;
  
  // Debug logging
  console.log('🔍 Dashboard - authUser:', authUser);
  console.log('🔍 Dashboard - appUser:', appUser);
  console.log('🔍 Dashboard - final user:', user);
  console.log('🔍 Dashboard - user skillsOffered:', user?.skillsOffered);
  console.log('🔍 Dashboard - user skillsWanted:', user?.skillsWanted);

  // Function to refresh current user data from profile API
  const refreshCurrentUserData = async () => {
    try {
      console.log('🔄 Dashboard - Refreshing current user data from profile API...');
      const profileResponse = await apiService.getProfile();
      console.log('✅ Dashboard - Profile API response:', profileResponse);
      
      if (profileResponse.data) {
        // Use the most current user data as base
        const baseUser = appUser || authUser;
        const updatedUser = {
          ...baseUser,
          ...profileResponse.data,
          skillsOffered: profileResponse.data.skillsOffered || [],
          skillsWanted: profileResponse.data.skillsWanted || []
        };
        
        console.log('✅ Dashboard - Updated user with profile data:', updatedUser);
        setRefreshedUser(updatedUser);
      }
    } catch (error) {
      console.error('❌ Dashboard - Failed to refresh current user data:', error);
    }
  };

  // Refresh current user data when component mounts
  useEffect(() => {
    console.log('Dashboard component mounted, refreshing current user data...');
    refreshCurrentUserData();
  }, []);


  const stats = [
    {
      title: 'Total Matches',
      value: user?.stats?.matches || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Skills Offered',
      value: user?.skillsOffered?.length || 0,
      icon: Star,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Skills Wanted',
      value: user?.skillsWanted?.length || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Active Chats',
      value: chats.length,
      icon: MessageCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const recentMatches = matches.slice(0, 3).map(match => ({
    ...match,
    user: {
      id: match.id,
      name: match.name,
      avatar: match.avatar,
      bio: match.bio,
      location: match.location,
      status: match.isOnline ? 'online' : 'offline',
      skillsOffered: match.skillsOffered || [],
      skillsWanted: match.skillsWanted || [],
      averageRating: match.averageRating || 0,
      ratingCount: match.ratingCount || 0,
      matchPercentage: match.matchPercentage || 0
    },
    // Include rating data from the match
    averageRating: match.averageRating || 0,
    ratingCount: match.ratingCount || 0,
    matchPercentage: match.matchPercentage || 0
  }));

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
      const response = await apiService.submitRating(selectedUser.id, rating, comment);
      
      if (response.data) {
        alert('Rating submitted successfully!');
        setShowRatingDialog(false);
        setSelectedUser(null);
        setUserRating(0);
        
        // Add user to rated users set
        addRatedUser(selectedUser.id);
        
        // Refresh data to update ratings
        // You might want to refresh the matches data here
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
      const userData = matches.find(match => match.id === userId);
      
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

  if (loading || !user) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to exchange some skills today?
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link to="/profile">
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Manage Skills
            </Button>
          </Link>
          <Link to="/matches">
            <Button size="sm">
              Find Matches
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Matches and Skills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Matches - Takes 2/3 of the width */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Matches</h2>
            <Link 
              to="/matches" 
              className="text-primary-600 hover:text-primary-500 font-medium text-sm flex items-center"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentMatches.length > 0 ? (
              recentMatches.map((match) => (
                <UserCard
                  key={match.id}
                  user={match.user}
                  currentUser={user}
                  onMessage={handleMessage}
                  onViewProfile={handleViewProfile}
                  onRateUser={handleRateUser}
                  ratedUsers={ratedUsers}
                  showSkills={true}
                  variant="list"
                />
              ))
            ) : (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matches yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your skills to find people to exchange with</p>
                <Link to="/profile">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skills
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>

        {/* Skills Summary - Takes 1/3 of the width */}
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
              <Link to="/profile">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            
            {/* Skills Offered */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills I Can Offer</h4>
              <div className="flex flex-wrap gap-1">
                {user?.skillsOffered?.slice(0, 3).map((skill) => (
                  <Badge key={skill.id || skill.name} variant="offered" size="sm">
                    {skill.skillName || skill.name}
                    {skill.proficiencyLevel && (
                      <span className="ml-1 text-xs opacity-75">
                        ({skill.proficiencyLevel})
                      </span>
                    )}
                  </Badge>
                ))}
                {(!user?.skillsOffered || user.skillsOffered.length === 0) && (
                  <p className="text-gray-500 text-sm">No skills added</p>
                )}
                {user?.skillsOffered?.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{user.skillsOffered.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            {/* Skills Wanted */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Skills I Want to Learn</h4>
              <div className="flex flex-wrap gap-1">
                {user?.skillsWanted?.slice(0, 3).map((skill) => (
                  <Badge key={skill.id || skill.name} variant="wanted" size="sm">
                    {skill.skillName || skill.name}
                    {skill.urgencyLevel && (
                      <span className="ml-1 text-xs opacity-75">
                        ({skill.urgencyLevel})
                      </span>
                    )}
                  </Badge>
                ))}
                {(!user?.skillsWanted || user.skillsWanted.length === 0) && (
                  <p className="text-gray-500 text-sm">No skills added</p>
                )}
                {user?.skillsWanted?.length > 3 && (
                  <Badge variant="outline" size="sm">
                    +{user.skillsWanted.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

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

export default Dashboard;
