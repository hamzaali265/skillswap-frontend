import React from 'react';
import { Link } from 'react-router-dom';
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
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const { matches, chats, loading } = useApp();

  console.log('Dashboard - user:', user);
  console.log('Dashboard - matches:', matches);
  console.log('Dashboard - loading:', loading);

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
      status: match.isOnline ? 'online' : 'offline'
    }
  }));

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

      {/* Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <Card key={match.id} className="p-6 hover:shadow-card-hover transition-all duration-200">
                  <div className="flex items-start space-x-4">
                    <Avatar 
                      src={match.user.avatar} 
                      alt={match.user.name} 
                      size="lg" 
                      status={match.user.status}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{match.user.name}</h3>
                        <Badge variant="success" size="sm">
                          {match.matchPercentage}% match
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{match.user.bio}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.user.location}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {match.user.stats?.rating || 0} rating
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
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

        {/* Skills Summary */}
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
    </div>
  );
};

export default Dashboard;
