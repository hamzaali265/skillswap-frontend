import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, MessageCircle, Calendar, Edit, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Rating from '../components/ui/Rating';
import RatingDialog from '../components/ui/RatingDialog';
import { formatDate } from '../utils/helpers';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { handleMessageButtonClick } = useApp();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching user profile for ID:', id);
        console.log('Current user:', currentUser);
        
        let userData = null;
        
        // Primary: Try to get user profile from API
        try {
          console.log('🔄 Attempting to fetch user profile from API...');
          const response = await apiService.getOtherUserProfile(id);
          if (response.data) {
            console.log('✅ Successfully fetched user data from API:', response.data);
            userData = response.data;
          }
        } catch (apiError) {
          console.warn('⚠️ Could not fetch user data from API:', apiError.message);
          
          // Fallback: Try to get from matches
          try {
            console.log('🔄 Attempting to fetch user data from matches as fallback...');
            const matchesResponse = await apiService.getMatchesAlternative();
            console.log('✅ Matches response:', matchesResponse);
            
            if (matchesResponse.data) {
              // Look for the user in the matches data
              const allUsers = matchesResponse.data.users || matchesResponse.data || [];
              userData = allUsers.find(user => user.id === id);
              console.log('🔍 Found user in matches:', userData);
            }
          } catch (matchesError) {
            console.warn('⚠️ Could not fetch user data from matches either:', matchesError.message);
          }
        }
        
        if (userData) {
          console.log('✅ Setting user profile data:', userData);
          setUserProfile(userData);
          
          // Set rating data from user data
          setAverageRating(userData.averageRating || 0);
          setRatingCount(userData.ratingCount || 0);
          setUserRating(userData.userRating || 0);
          setHasRated(!!userData.userRating);
        } else {
          console.error('❌ User not found in any data source');
          setError('User not found. This user might not be in your matches or the profile is not accessible.');
        }
      } catch (err) {
        console.error('❌ Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    } else {
      console.error('❌ No ID provided');
      setError('No user ID provided');
      setLoading(false);
    }
  }, [id, currentUser]);

  const handleMessage = async () => {
    try {
      if (!userProfile) {
        console.error('❌ User profile not loaded');
        return;
      }
      
      console.log('🔄 Handling message button click for user:', id);
      // Use the new handleMessageButtonClick function
      await handleMessageButtonClick(id, userProfile, navigate);
    } catch (error) {
      console.error('❌ Error handling message button click:', error);
    }
  };

  const handleRating = async (rating, comment = '') => {
    try {
      console.log('🔄 Submitting rating:', rating, 'for user:', id);
      console.log('Current user:', currentUser);
      console.log('Target user ID:', id);
      console.log('Auth token exists:', !!localStorage.getItem('skillswap_token'));
      console.log('Rating comment:', comment);
      
      // Check if user is authenticated
      if (!currentUser || !localStorage.getItem('skillswap_token')) {
        console.error('❌ User not authenticated');
        alert('Please log in to rate users');
        return;
      }
      
      // Check if user is trying to rate themselves
      if (currentUser.id === id) {
        console.error('❌ User cannot rate themselves');
        alert('You cannot rate your own profile');
        return;
      }
      
      // Validate rating value
      if (rating < 1 || rating > 5) {
        console.error('❌ Invalid rating value:', rating);
        alert('Please provide a valid rating between 1 and 5');
        return;
      }
      
      console.log('🔄 Making API call to submit rating...');
      const response = await apiService.submitRating(id, rating, comment);
      console.log('✅ Rating submission response:', response);
      
      if (response.data) {
        setUserRating(rating);
        setHasRated(true);
        setAverageRating(response.data.averageRating);
        setRatingCount(response.data.ratingCount);
        
        // Update the user profile with new rating data
        setUserProfile(prev => ({
          ...prev,
          averageRating: response.data.averageRating,
          ratingCount: response.data.ratingCount
        }));
        
        setShowRatingDialog(false);
        console.log('✅ Rating submitted successfully');
      }
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading user profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Profile Not Found</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">User Not Found</h3>
              <p className="text-gray-500">The user profile you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar
              src={userProfile.avatar}
              alt={userProfile.name}
              size="xl"
              fallback={userProfile.name}
              className="w-24 h-24"
            />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{userProfile.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    {userProfile.location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {userProfile.location}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {formatDate(userProfile.createdAt || new Date())}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center space-x-2 mb-3">
                    <Rating value={averageRating} readonly />
                    <span className="text-sm text-gray-600">
                      ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleMessage}
                    className="flex items-center"
                    disabled={!userProfile}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  
                  {currentUser && currentUser.id !== id && (
                    <Button
                      variant="outline"
                      onClick={() => setShowRatingDialog(true)}
                      disabled={hasRated}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {hasRated ? 'Rated' : 'Rate'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        {userProfile.bio && (
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
          </Card>
        )}

        {/* Skills */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Skills Offered */}
          {userProfile.skillsOffered && userProfile.skillsOffered.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Skills Offered
              </h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.skillsOffered.map((skill, index) => (
                  <Badge key={index} variant="primary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Skills Wanted */}
          {userProfile.skillsWanted && userProfile.skillsWanted.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Skills Wanted
              </h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.skillsWanted.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Rating Dialog */}
        {showRatingDialog && (
          <RatingDialog
            isOpen={showRatingDialog}
            onClose={() => setShowRatingDialog(false)}
            onSubmit={handleRating}
            currentRating={userRating}
          />
        )}
      </div>
    </div>
  );
};

export default UserProfile;
