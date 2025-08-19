import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Plus, MapPin, Star, Users, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../contexts/AppContext';
import apiService from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { availableSkills } from '../types';

const Profile = () => {
  const { user: authUser, updateProfile, refreshUserData, loading } = useAuth();
  const { currentUser: appUser, updateCurrentUser } = useApp();
  
  // Use the most current user data (prefer appUser if available, fallback to authUser)
  const user = appUser || authUser;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    avatar: user?.avatar || '',
    skillsOffered: user?.skillsOffered || [],
    skillsWanted: user?.skillsWanted || []
  });
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [skillType, setSkillType] = useState('offered'); // 'offered' or 'wanted'
  const [skillSearch, setSkillSearch] = useState('');
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillSuccess, setSkillSuccess] = useState('');
  const [selectedProficiencyLevel, setSelectedProficiencyLevel] = useState('intermediate');
  const [selectedUrgencyLevel, setSelectedUrgencyLevel] = useState('medium');

  // Debug logging
  console.log('Profile component - Current user:', user);
  console.log('Profile component - Current editData:', editData);
  console.log('Profile component - isEditing:', isEditing);

  // Function to refresh current user data from profile API
  const refreshCurrentUserData = async () => {
    try {
      console.log('🔄 Refreshing current user data from profile API...');
      const profileResponse = await apiService.getProfile();
      console.log('✅ Profile API response:', profileResponse);
      
      if (profileResponse.data) {
        const updatedUser = {
          ...user,
          ...profileResponse.data,
          skillsOffered: profileResponse.data.skillsOffered || [],
          skillsWanted: profileResponse.data.skillsWanted || []
        };
        
        console.log('✅ Updated user with profile data:', updatedUser);
        updateCurrentUser(updatedUser);
        
        // Also update the auth context
        await refreshUserData();
      }
    } catch (error) {
      console.error('❌ Failed to refresh current user data:', error);
    }
  };

  // Update editData when user changes (but only when not editing)
  useEffect(() => {
    if (!isEditing && user) {
      console.log('User changed, updating editData:', user);
      setEditData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        avatar: user.avatar || '',
        skillsOffered: user.skillsOffered || [],
        skillsWanted: user.skillsWanted || []
      });
    }
  }, [user, isEditing]);

  // Refresh current user data when component mounts
  useEffect(() => {
    console.log('Profile component mounted, refreshing current user data...');
    refreshCurrentUserData();
  }, []);

  const handleSave = async () => {
    try {
      console.log('Saving profile data:', editData);
      await updateProfile(editData);
      
      // Refresh user data to get the latest from backend
      console.log('Refreshing user data after save...');
      await refreshUserData();
      await refreshCurrentUserData();
      console.log('User data refreshed after save');
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      avatar: user?.avatar || '',
      skillsOffered: user?.skillsOffered || [],
      skillsWanted: user?.skillsWanted || []
    });
    setIsEditing(false);
  };

  // Initialize editData when entering edit mode
  const handleEditMode = () => {
    console.log('Current user data:', user);
    
    setEditData({
      name: user?.name || '',
      bio: user?.bio || '',
      location: user?.location || '',
      avatar: user?.avatar || '',
      skillsOffered: user?.skillsOffered || [],
      skillsWanted: user?.skillsWanted || []
    });
    setIsEditing(true);
  };

  const addSkill = async (skill) => {
    setSkillLoading(true);
    setSkillSuccess('');
    try {
      console.log('Adding skill:', skill, 'Type:', skillType);
      console.log('Current editData before adding skill:', editData);
      
      if (skillType === 'offered') {
        const response = await apiService.addOfferedSkill({
          skillName: skill.name,
          proficiencyLevel: selectedProficiencyLevel,
          description: `I can help with ${skill.name}`
        });
        console.log('Add offered skill response:', response);
        
        // Update local editData state immediately with all profile data
        const updatedEditData = {
          ...editData,
          skillsOffered: [...editData.skillsOffered, { 
            id: response.data?.id || Date.now().toString(),
            skillName: skill.name,
            name: skill.name,
            proficiencyLevel: selectedProficiencyLevel
          }]
        };
        console.log('Updated editData after adding offered skill:', updatedEditData);
        setEditData(updatedEditData);
        
      } else {
        const response = await apiService.addWantedSkill({
          skillName: skill.name,
          urgencyLevel: selectedUrgencyLevel,
          description: `I want to learn ${skill.name}`
        });
        console.log('Add wanted skill response:', response);
        
        // Update local editData state immediately with all profile data
        const updatedEditData = {
          ...editData,
          skillsWanted: [...editData.skillsWanted, { 
            id: response.data?.id || Date.now().toString(),
            skillName: skill.name,
            name: skill.name,
            urgencyLevel: selectedUrgencyLevel
          }]
        };
        console.log('Updated editData after adding wanted skill:', updatedEditData);
        setEditData(updatedEditData);
      }
      
      // Refresh user data in background
      console.log('Fetching updated profile from API...');
      const updatedProfile = await apiService.getProfile();
      console.log('Updated profile from API:', updatedProfile);
      
      // Update the user in the auth context with complete profile data
      if (updatedProfile.data) {
        console.log('Refreshing user data with fresh profile...');
        await refreshUserData();
        await refreshCurrentUserData();
        console.log('User data refreshed successfully');
        setSkillSuccess(`${skill.name} added successfully!`);
      } else {
        console.error('No data in updatedProfile response');
      }
      
      setShowSkillModal(false);
      setSkillSearch('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSkillSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add skill:', error);
    } finally {
      setSkillLoading(false);
    }
  };

  const removeSkill = async (skillId, type) => {
    setSkillLoading(true);
    try {
      console.log('Removing skill:', skillId, 'Type:', type);
      console.log('Current editData before removing skill:', editData);
      
      // Update local editData state immediately with all profile data
      let updatedEditData;
      if (type === 'offered') {
        updatedEditData = {
          ...editData,
          skillsOffered: editData.skillsOffered.filter(skill => skill.id !== skillId)
        };
        console.log('Updated editData after removing offered skill:', updatedEditData);
        setEditData(updatedEditData);
      } else {
        updatedEditData = {
          ...editData,
          skillsWanted: editData.skillsWanted.filter(skill => skill.id !== skillId)
        };
        console.log('Updated editData after removing wanted skill:', updatedEditData);
        setEditData(updatedEditData);
      }
      
      if (type === 'offered') {
        const response = await apiService.deleteOfferedSkill(skillId);
        console.log('Delete offered skill response:', response);
      } else {
        const response = await apiService.deleteWantedSkill(skillId);
        console.log('Delete wanted skill response:', response);
      }
      
      // Refresh user data in background
      console.log('Fetching updated profile from API after removal...');
      const updatedProfile = await apiService.getProfile();
      console.log('Updated profile from API after removal:', updatedProfile);
      
      // Update the user in the auth context with complete profile data
      if (updatedProfile.data) {
        console.log('Refreshing user data after removal...');
        await refreshUserData();
        await refreshCurrentUserData();
        console.log('User data refreshed successfully after removal');
      } else {
        console.error('No data in updatedProfile response after removal');
      }
    } catch (error) {
      console.error('Failed to remove skill:', error);
      // Revert local state if API call failed
      if (type === 'offered') {
        setEditData(prev => ({
          ...prev,
          skillsOffered: user?.skillsOffered || []
        }));
      } else {
        setEditData(prev => ({
          ...prev,
          skillsWanted: user?.skillsWanted || []
        }));
      }
    } finally {
      setSkillLoading(false);
    }
  };

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !editData.skillsOffered.find(s => s.name === skill.name) &&
    !editData.skillsWanted.find(s => s.name === skill.name)
  );

  const stats = [
    {
      label: 'Total Matches',
      value: user?.stats?.matches || 0,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Rating',
      value: user?.stats?.rating || 0,
      icon: Star,
      color: 'text-yellow-600'
    },
  ];

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="flex items-center gap-3">
          {!isEditing && (
            <>
              <Button
                onClick={refreshCurrentUserData}
                variant="outline"
                size="sm"
                disabled={loading}
              >
                Refresh
              </Button>
              <Button onClick={handleEditMode} variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button onClick={handleCancel} variant="outline" size="sm">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Success Message */}
      {skillSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-600 text-sm">{skillSuccess}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <div className="flex items-start space-x-6">
              <Avatar 
                src={user?.avatar} 
                alt={user?.name} 
                size="xl" 
                status={user?.isOnline ? 'online' : 'offline'}
              />
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input
                      label="Location"
                      icon={MapPin}
                      value={editData.location}
                      onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                    <p className="text-gray-600 mt-1 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {user?.location}
                    </p>
                    <p className="text-gray-700 mt-3">{user?.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Skills Offered */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills I Can Offer</h3>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSkillType('offered');
                    setShowSkillModal(true);
                  }}
                  disabled={skillLoading}
                >
                  {skillLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Skill
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData.skillsOffered : user?.skillsOffered || []).map((skill) => (
                <div key={skill.id || skill.name} className="flex items-center gap-1">
                  <Badge variant="offered" size="sm">
                    {skill.skillName || skill.name}
                    {skill.proficiencyLevel && (
                      <span className="ml-1 text-xs opacity-75">
                        ({skill.proficiencyLevel})
                      </span>
                    )}
                  </Badge>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill.id, 'offered')}
                      className="text-red-500 hover:text-red-700"
                      disabled={skillLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {(isEditing ? editData.skillsOffered : user?.skillsOffered || []).length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>
          </Card>

          {/* Skills Wanted */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Skills I Want to Learn</h3>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSkillType('wanted');
                    setShowSkillModal(true);
                  }}
                  disabled={skillLoading}
                >
                  {skillLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-500 rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Skill
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData.skillsWanted : user?.skillsWanted || []).map((skill) => (
                <div key={skill.id || skill.name} className="flex items-center gap-1">
                  <Badge variant="wanted" size="sm">
                    {skill.skillName || skill.name}
                    {skill.urgencyLevel && (
                      <span className="ml-1 text-xs opacity-75">
                        ({skill.urgencyLevel})
                      </span>
                    )}
                  </Badge>
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill.id, 'wanted')}
                      className="text-red-500 hover:text-red-700"
                      disabled={skillLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {(isEditing ? editData.skillsWanted : user?.skillsWanted || []).length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet</p>
              )}
            </div>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stats</h3>
            <div className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="text-sm text-gray-600">{stat.label}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Account Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900 capitalize">{user?.isOnline ? 'online' : 'offline'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add {skillType === 'offered' ? 'Skill to Offer' : 'Skill to Learn'}
              </h3>
              <button
                onClick={() => setShowSkillModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <Input
              placeholder="Search skills..."
              value={skillSearch}
              onChange={(e) => setSkillSearch(e.target.value)}
              className="mb-4"
            />

            {/* Proficiency Level Selection for Offered Skills */}
            {skillType === 'offered' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level
                </label>
                <select
                  value={selectedProficiencyLevel}
                  onChange={(e) => setSelectedProficiencyLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            )}

            {/* Urgency Level Selection for Wanted Skills */}
            {skillType === 'wanted' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level
                </label>
                <select
                  value={selectedUrgencyLevel}
                  onChange={(e) => setSelectedUrgencyLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            )}
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredSkills.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => addSkill(skill)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  disabled={skillLoading}
                >
                  <div className="font-medium text-gray-900">{skill.name}</div>
                  <div className="text-sm text-gray-500 capitalize">{skill.category}</div>
                </button>
              ))}
              {filteredSkills.length === 0 && (
                <p className="text-gray-500 text-center py-4">No skills found</p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;
