import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, MessageCircle, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { calculateMatchPercentage, getCommonSkills, formatDate } from '../utils/helpers';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log('Fetching user profile for ID:', id);
        const response = await apiService.getMatchDetails(id);
        console.log('User profile response:', response);
        
        if (response.data) {
          console.log('Setting user profile data:', response.data);
          setUserProfile(response.data);
        } else {
          console.error('No data in response');
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserProfile();
    } else {
      console.error('No ID provided');
      setError('No user ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleMessage = () => {
    // Navigate to chat with this user
    navigate(`/chat/${id}`);
  };

  const getMatchPercentage = () => {
    if (!currentUser || !userProfile) return 0;
    return calculateMatchPercentage(currentUser, userProfile);
  };

  const getCommonSkillsForUser = () => {
    if (!currentUser || !userProfile) return [];
    return getCommonSkills(currentUser, userProfile);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-32 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/matches')}>
            Back to Matches
          </Button>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  const matchPercentage = getMatchPercentage();
  const commonSkills = getCommonSkillsForUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/matches')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Matches
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
            <p className="text-gray-600">User Profile</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleMessage}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <div className="text-center mb-6">
              <Avatar 
                src={userProfile.avatar} 
                alt={userProfile.name} 
                size="xl" 
                status={userProfile.isOnline ? 'online' : 'offline'}
                className="mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{userProfile.name}</h2>
              <p className="text-gray-600 mb-4">{userProfile.bio || 'No bio available'}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {userProfile.location || 'No location'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Member since {formatDate(userProfile.createdAt)}
                </div>
              </div>

              <Badge 
                variant={matchPercentage >= 80 ? 'success' : matchPercentage >= 60 ? 'warning' : 'info'} 
                size="lg"
              >
                {matchPercentage}% match
              </Badge>
            </div>
          </Card>

          {/* Skills Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Skills Offered */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills I Can Offer</h3>
              <div className="space-y-3">
                {userProfile.skillsOffered && userProfile.skillsOffered.length > 0 ? (
                  userProfile.skillsOffered.map((skill) => (
                    <div key={skill.id || skill.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{skill.skillName || skill.name}</p>
                        {skill.proficiencyLevel && (
                          <p className="text-sm text-gray-600 capitalize">{skill.proficiencyLevel} level</p>
                        )}
                      </div>
                      <Badge variant="offered" size="sm">
                        {skill.proficiencyLevel || 'intermediate'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No skills offered yet</p>
                )}
              </div>
            </Card>

            {/* Skills Wanted */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills I Want to Learn</h3>
              <div className="space-y-3">
                {userProfile.skillsWanted && userProfile.skillsWanted.length > 0 ? (
                  userProfile.skillsWanted.map((skill) => (
                    <div key={skill.id || skill.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{skill.skillName || skill.name}</p>
                        {skill.urgencyLevel && (
                          <p className="text-sm text-gray-600 capitalize">{skill.urgencyLevel} priority</p>
                        )}
                      </div>
                      <Badge variant="wanted" size="sm">
                        {skill.urgencyLevel || 'medium'}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No skills wanted yet</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Details */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Details</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{matchPercentage}%</div>
                <p className="text-gray-600">Compatibility Match</p>
              </div>
              
              {commonSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Common Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {commonSkills.map((skill) => (
                      <Badge key={skill} variant="default" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userProfile.iCanHelpThem && userProfile.iCanHelpThem.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">I Can Help With</h4>
                  <div className="flex flex-wrap gap-1">
                    {userProfile.iCanHelpThem.map((skill) => (
                      <Badge key={skill} variant="offered" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {userProfile.theyCanHelpMe && userProfile.theyCanHelpMe.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">They Can Help With</h4>
                  <div className="flex flex-wrap gap-1">
                    {userProfile.theyCanHelpMe.map((skill) => (
                      <Badge key={skill} variant="wanted" size="sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Contact Actions */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
            <div className="space-y-3">
              <Button onClick={handleMessage} className="w-full">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button variant="outline" onClick={() => navigate('/matches')} className="w-full">
                Back to Matches
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
