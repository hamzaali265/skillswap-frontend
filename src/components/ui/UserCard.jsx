import React from 'react';
import { MapPin, Star, MessageCircle } from 'lucide-react';
import Card from './Card';
import Button from './Button';
import Avatar from './Avatar';
import Badge from './Badge';
import Rating from './Rating';
import { getCommonSkills } from '../../utils/helpers';

const UserCard = ({ 
  user, 
  currentUser, 
  onMessage, 
  onViewProfile, 
  onRateUser, 
  ratedUsers = new Set(),
  showSkills = true,
  variant = 'grid', // 'grid' or 'list'
  className = ''
}) => {
  const matchPercentage = user.matchPercentage || 0;
  const commonSkills = showSkills ? getCommonSkills(currentUser, user) : [];

  // Debug: Log user data
  console.log('🔍 UserCard received user:', user);
  console.log('🔍 UserCard skills offered:', user.skillsOffered);
  console.log('🔍 UserCard skills wanted:', user.skillsWanted);

  // Check if rating button should be shown
  const shouldShowRatingButton = currentUser && currentUser.id !== user.id && !ratedUsers.has(user.id);

  if (variant === 'list') {
    return (
      <Card className={`p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 ${className}`}>
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar 
              src={user.avatar} 
              alt={user.name} 
              size="xl" 
              status={user.status}
              className="ring-4 ring-white shadow-lg"
            />
            <div className="absolute -top-2 -right-2">
              <Badge 
                variant={matchPercentage >= 80 ? 'success' : matchPercentage >= 60 ? 'warning' : 'info'} 
                size="sm"
                className="text-xs font-semibold"
              >
                {matchPercentage}%
              </Badge>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 flex items-center mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </p>
                <div className="flex items-center">
                  <Rating 
                    value={user.averageRating || 0} 
                    readonly 
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 ml-2 font-medium">
                    {user.averageRating ? user.averageRating.toFixed(1) : '0.0'} 
                    <span className="text-gray-400">({user.ratingCount || 0})</span>
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-2">
              {user.bio || "This user hasn't added a bio yet."}
            </p>

            {showSkills && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Skills Offered
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsOffered?.slice(0, 3).map((skill) => (
                      <Badge key={skill.id || skill.name} variant="offered" size="sm" className="text-xs">
                        {skill.skillName || skill.name}
                        {skill.proficiencyLevel && (
                          <span className="ml-1 opacity-75">
                            ({skill.proficiencyLevel})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Skills Wanted
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {user.skillsWanted?.slice(0, 3).map((skill) => (
                      <Badge key={skill.id || skill.name} variant="wanted" size="sm" className="text-xs">
                        {skill.skillName || skill.name}
                        {skill.urgencyLevel && (
                          <span className="ml-1 opacity-75">
                            ({skill.urgencyLevel})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                {commonSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Common Skills
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {commonSkills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="default" size="sm" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-3 min-w-[140px]">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 font-medium"
              onClick={() => onMessage(user.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              onClick={() => onViewProfile(user.id)}
            >
              View Profile
            </Button>
            {shouldShowRatingButton && (
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-800 transition-all duration-200 font-medium"
                onClick={() => onRateUser(user)}
              >
                <Star className="w-4 h-4 mr-2" />
                Rate User
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 border border-gray-100 ${className}`}>
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <Avatar 
            src={user.avatar} 
            alt={user.name} 
            size="xl" 
            status={user.status}
            className="mx-auto ring-4 ring-white shadow-lg"
          />
          <div className="absolute -top-2 -right-2">
            <Badge 
              variant={matchPercentage >= 80 ? 'success' : matchPercentage >= 60 ? 'warning' : 'info'} 
              size="sm"
              className="text-xs font-semibold"
            >
              {matchPercentage}%
            </Badge>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center justify-center">
          <MapPin className="w-4 h-4 mr-1" />
          {user.location}
        </p>
        
        {/* Rating Display */}
        <div className="flex items-center justify-center mb-4">
          <Rating 
            value={user.averageRating || 0} 
            readonly 
            size="sm"
          />
          <span className="text-sm text-gray-600 ml-2 font-medium">
            {user.averageRating ? user.averageRating.toFixed(1) : '0.0'} 
            <span className="text-gray-400">({user.ratingCount || 0})</span>
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
          {user.bio || "This user hasn't added a bio yet."}
        </p>

        {showSkills && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Skills Offered
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsOffered?.slice(0, 3).map((skill) => (
                  <Badge key={skill.id || skill.name} variant="offered" size="sm" className="text-xs">
                    {skill.skillName || skill.name}
                    {skill.proficiencyLevel && (
                      <span className="ml-1 opacity-75">
                        ({skill.proficiencyLevel})
                      </span>
                    )}
                  </Badge>
                ))}
                {user.skillsOffered?.length > 3 && (
                  <Badge variant="info" size="sm" className="text-xs">
                    +{user.skillsOffered.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Skills Wanted
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {user.skillsWanted?.slice(0, 3).map((skill) => (
                  <Badge key={skill.id || skill.name} variant="wanted" size="sm" className="text-xs">
                    {skill.skillName || skill.name}
                    {skill.urgencyLevel && (
                      <span className="ml-1 opacity-75">
                        ({skill.urgencyLevel})
                      </span>
                    )}
                  </Badge>
                ))}
                {user.skillsWanted?.length > 3 && (
                  <Badge variant="info" size="sm" className="text-xs">
                    +{user.skillsWanted.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {commonSkills.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Common Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {commonSkills.slice(0, 2).map((skill) => (
                    <Badge key={skill} variant="default" size="sm" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {commonSkills.length > 2 && (
                    <Badge variant="info" size="sm" className="text-xs">
                      +{commonSkills.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900 transition-all duration-200 font-medium"
            onClick={() => onMessage(user.id)}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            onClick={() => onViewProfile(user.id)}
          >
            View Profile
          </Button>
        </div>
        
        {/* Rating Action */}
        {shouldShowRatingButton && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400 hover:text-yellow-800 transition-all duration-200 font-medium"
            onClick={() => onRateUser(user)}
          >
            <Star className="w-4 h-4 mr-2" />
            Rate User
          </Button>
        )}
      </div>
    </Card>
  );
};

export default UserCard;
