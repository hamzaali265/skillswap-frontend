import React, { useState } from 'react';
import { Search, Filter, Grid, List, MessageCircle, MapPin, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { calculateMatchPercentage, getCommonSkills, formatDate } from '../utils/helpers';

const Matches = () => {
  const { user } = useAuth();
  const { filteredUsers, loading, setSearchQuery, setFilters, filters, refreshData } = useApp();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  console.log('Matches component - filteredUsers:', filteredUsers);
  console.log('Matches component - current user:', user);

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

  const getMatchPercentage = (otherUser) => {
    if (!user || !otherUser) return 0;
    return calculateMatchPercentage(user, otherUser);
  };

  const getCommonSkillsForUser = (otherUser) => {
    if (!user || !otherUser) return [];
    return getCommonSkills(user, otherUser);
  };

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
          {processedUsers.map((otherUser) => {
            const matchPercentage = getMatchPercentage(otherUser);
            const commonSkills = getCommonSkillsForUser(otherUser);
            
            return (
              <Card key={otherUser.id} className="p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="text-center mb-4">
                  <Avatar 
                    src={otherUser.avatar} 
                    alt={otherUser.name} 
                    size="xl" 
                    status={otherUser.status}
                    className="mx-auto mb-3"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">{otherUser.name}</h3>
                  <p className="text-sm text-gray-600">{otherUser.location}</p>
                  <div className="mt-2">
                    <Badge 
                      variant={matchPercentage >= 80 ? 'success' : matchPercentage >= 60 ? 'warning' : 'info'} 
                      size="sm"
                    >
                      {matchPercentage}% match
                    </Badge>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{otherUser.bio}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Offered</h4>
                    <div className="flex flex-wrap gap-1">
                      {otherUser.skillsOffered.slice(0, 3).map((skill) => (
                        <Badge key={skill.id || skill.name} variant="offered" size="sm">
                          {skill.skillName || skill.name}
                          {skill.proficiencyLevel && (
                            <span className="ml-1 text-xs opacity-75">
                              ({skill.proficiencyLevel})
                            </span>
                          )}
                        </Badge>
                      ))}
                      {otherUser.skillsOffered.length > 3 && (
                        <Badge variant="info" size="sm">
                          +{otherUser.skillsOffered.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Wanted</h4>
                    <div className="flex flex-wrap gap-1">
                      {otherUser.skillsWanted.slice(0, 3).map((skill) => (
                        <Badge key={skill.id || skill.name} variant="wanted" size="sm">
                          {skill.skillName || skill.name}
                          {skill.urgencyLevel && (
                            <span className="ml-1 text-xs opacity-75">
                              ({skill.urgencyLevel})
                            </span>
                          )}
                        </Badge>
                      ))}
                      {otherUser.skillsWanted.length > 3 && (
                        <Badge variant="info" size="sm">
                          +{otherUser.skillsWanted.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {commonSkills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Common Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {commonSkills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="default" size="sm">
                            {skill}
                          </Badge>
                        ))}
                        {commonSkills.length > 2 && (
                          <Badge variant="info" size="sm">
                            +{commonSkills.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/profile/${otherUser.id}`)}>
                    View Profile
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {processedUsers.map((otherUser) => {
            const matchPercentage = getMatchPercentage(otherUser);
            const commonSkills = getCommonSkillsForUser(otherUser);
            
            return (
              <Card key={otherUser.id} className="p-6 hover:shadow-card-hover transition-all duration-200">
                <div className="flex items-start space-x-4">
                  <Avatar 
                    src={otherUser.avatar} 
                    alt={otherUser.name} 
                    size="lg" 
                    status={otherUser.status}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{otherUser.name}</h3>
                      <Badge 
                        variant={matchPercentage >= 80 ? 'success' : matchPercentage >= 60 ? 'warning' : 'info'} 
                        size="sm"
                      >
                        {matchPercentage}% match
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">{otherUser.bio}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {otherUser.location || 'No location'}
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        {otherUser.matchPercentage || 0}% match
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Offered</h4>
                        <div className="flex flex-wrap gap-1">
                          {otherUser.skillsOffered.slice(0, 3).map((skill) => (
                            <Badge key={skill.id || skill.name} variant="offered" size="sm">
                              {skill.skillName || skill.name}
                              {skill.proficiencyLevel && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({skill.proficiencyLevel})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Wanted</h4>
                        <div className="flex flex-wrap gap-1">
                          {otherUser.skillsWanted.slice(0, 3).map((skill) => (
                            <Badge key={skill.id || skill.name} variant="wanted" size="sm">
                              {skill.skillName || skill.name}
                              {skill.urgencyLevel && (
                                <span className="ml-1 text-xs opacity-75">
                                  ({skill.urgencyLevel})
                                </span>
                              )}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {commonSkills.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Common Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {commonSkills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="default" size="sm">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" onClick={() => navigate(`/profile/${otherUser.id}`)}>
                      View Profile
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {processedUsers.length === 0 && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more matches.
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSearchQuery('');
            setFilters({ skillLevel: 'all' });
          }}>
            Clear Filters
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Matches;
