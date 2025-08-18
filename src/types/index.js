// User related types
export const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  AWAY: 'away'
};

export const SKILL_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const SKILL_CATEGORY = {
  FRONTEND: 'frontend',
  BACKEND: 'backend',
  FULLSTACK: 'fullstack',
  DESIGN: 'design',
  DEVOPS: 'devops',
  MOBILE: 'mobile',
  DATABASE: 'database',
  OTHER: 'other'
};

// Mock data structure examples
export const mockUsers = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer passionate about React and Node.js. Love building scalable applications.',
    location: 'San Francisco, CA',
    status: USER_STATUS.ONLINE,
    skillsOffered: [
      { name: 'React', level: SKILL_LEVEL.EXPERT, category: SKILL_CATEGORY.FRONTEND },
      { name: 'Node.js', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.BACKEND },
      { name: 'TypeScript', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.FRONTEND }
    ],
    skillsWanted: [
      { name: 'Python', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.BACKEND },
      { name: 'Docker', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.DEVOPS }
    ],
    stats: {
      matches: 12,
      skillsOffered: 3,
      skillsWanted: 2,
      rating: 4.8
    }
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    bio: 'UI/UX designer with 5 years of experience. Specialized in creating beautiful and functional interfaces.',
    location: 'New York, NY',
    status: USER_STATUS.ONLINE,
    skillsOffered: [
      { name: 'Figma', level: SKILL_LEVEL.EXPERT, category: SKILL_CATEGORY.DESIGN },
      { name: 'Adobe XD', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.DESIGN },
      { name: 'Sketch', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.DESIGN }
    ],
    skillsWanted: [
      { name: 'React', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.FRONTEND },
      { name: 'CSS', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.FRONTEND }
    ],
    stats: {
      matches: 8,
      skillsOffered: 3,
      skillsWanted: 2,
      rating: 4.9
    }
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'DevOps engineer focused on cloud infrastructure and automation. AWS certified professional.',
    location: 'Austin, TX',
    status: USER_STATUS.AWAY,
    skillsOffered: [
      { name: 'AWS', level: SKILL_LEVEL.EXPERT, category: SKILL_CATEGORY.DEVOPS },
      { name: 'Docker', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.DEVOPS },
      { name: 'Kubernetes', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.DEVOPS },
      { name: 'Terraform', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.DEVOPS }
    ],
    skillsWanted: [
      { name: 'Python', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.BACKEND },
      { name: 'React', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.FRONTEND }
    ],
    stats: {
      matches: 15,
      skillsOffered: 4,
      skillsWanted: 2,
      rating: 4.7
    }
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Mobile developer specializing in React Native and iOS development. Love creating smooth user experiences.',
    location: 'Seattle, WA',
    status: USER_STATUS.OFFLINE,
    skillsOffered: [
      { name: 'React Native', level: SKILL_LEVEL.EXPERT, category: SKILL_CATEGORY.MOBILE },
      { name: 'iOS Development', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.MOBILE },
      { name: 'Swift', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.MOBILE }
    ],
    skillsWanted: [
      { name: 'Node.js', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.BACKEND },
      { name: 'MongoDB', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.DATABASE }
    ],
    stats: {
      matches: 6,
      skillsOffered: 3,
      skillsWanted: 2,
      rating: 4.6
    }
  },
  {
    id: '5',
    name: 'David Kim',
    email: 'david@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    bio: 'Backend developer with expertise in Python and Django. Passionate about building robust APIs.',
    location: 'Boston, MA',
    status: USER_STATUS.ONLINE,
    skillsOffered: [
      { name: 'Python', level: SKILL_LEVEL.EXPERT, category: SKILL_CATEGORY.BACKEND },
      { name: 'Django', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.BACKEND },
      { name: 'PostgreSQL', level: SKILL_LEVEL.ADVANCED, category: SKILL_CATEGORY.DATABASE },
      { name: 'FastAPI', level: SKILL_LEVEL.INTERMEDIATE, category: SKILL_CATEGORY.BACKEND }
    ],
    skillsWanted: [
      { name: 'React', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.FRONTEND },
      { name: 'Docker', level: SKILL_LEVEL.BEGINNER, category: SKILL_CATEGORY.DEVOPS }
    ],
    stats: {
      matches: 18,
      skillsOffered: 4,
      skillsWanted: 2,
      rating: 4.9
    }
  }
];

export const mockMatches = [
  {
    id: '1',
    user: mockUsers[1],
    matchPercentage: 85,
    commonSkills: ['React', 'CSS'],
    lastInteraction: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    user: mockUsers[2],
    matchPercentage: 72,
    commonSkills: ['Python', 'React'],
    lastInteraction: '2024-01-14T15:45:00Z'
  },
  {
    id: '3',
    user: mockUsers[3],
    matchPercentage: 68,
    commonSkills: ['React Native'],
    lastInteraction: '2024-01-13T09:20:00Z'
  },
  {
    id: '4',
    user: mockUsers[4],
    matchPercentage: 91,
    commonSkills: ['Python', 'React', 'Docker'],
    lastInteraction: '2024-01-12T14:15:00Z'
  }
];

export const mockChats = [
  {
    id: '1',
    user: mockUsers[1],
    lastMessage: {
      text: 'Hey! I saw you\'re looking for React help. I\'d love to help you get started!',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: true
    },
    unreadCount: 0
  },
  {
    id: '2',
    user: mockUsers[2],
    lastMessage: {
      text: 'Thanks for the Docker tips yesterday. Really helped me out!',
      timestamp: '2024-01-14T15:45:00Z',
      isRead: false
    },
    unreadCount: 1
  },
  {
    id: '3',
    user: mockUsers[3],
    lastMessage: {
      text: 'When are you free for our React Native session?',
      timestamp: '2024-01-13T09:20:00Z',
      isRead: true
    },
    unreadCount: 0
  }
];

export const mockMessages = [
  {
    id: '1',
    chatId: '1',
    senderId: '2',
    text: 'Hey! I saw you\'re looking for React help. I\'d love to help you get started!',
    timestamp: '2024-01-15T10:30:00Z',
    isRead: true
  },
  {
    id: '2',
    chatId: '1',
    senderId: '1',
    text: 'That would be amazing! I\'m really struggling with hooks and state management.',
    timestamp: '2024-01-15T10:32:00Z',
    isRead: true
  },
  {
    id: '3',
    chatId: '1',
    senderId: '2',
    text: 'No worries! Hooks can be tricky at first. Let me know when you\'re free and we can go through it together.',
    timestamp: '2024-01-15T10:35:00Z',
    isRead: true
  },
  {
    id: '4',
    chatId: '2',
    senderId: '3',
    text: 'Thanks for the Docker tips yesterday. Really helped me out!',
    timestamp: '2024-01-14T15:45:00Z',
    isRead: false
  }
];

export const availableSkills = [
  // Frontend
  { name: 'React', category: SKILL_CATEGORY.FRONTEND },
  { name: 'Vue.js', category: SKILL_CATEGORY.FRONTEND },
  { name: 'Angular', category: SKILL_CATEGORY.FRONTEND },
  { name: 'TypeScript', category: SKILL_CATEGORY.FRONTEND },
  { name: 'JavaScript', category: SKILL_CATEGORY.FRONTEND },
  { name: 'HTML/CSS', category: SKILL_CATEGORY.FRONTEND },
  { name: 'Tailwind CSS', category: SKILL_CATEGORY.FRONTEND },
  { name: 'Next.js', category: SKILL_CATEGORY.FRONTEND },
  
  // Backend
  { name: 'Node.js', category: SKILL_CATEGORY.BACKEND },
  { name: 'Python', category: SKILL_CATEGORY.BACKEND },
  { name: 'Java', category: SKILL_CATEGORY.BACKEND },
  { name: 'C#', category: SKILL_CATEGORY.BACKEND },
  { name: 'Go', category: SKILL_CATEGORY.BACKEND },
  { name: 'Ruby', category: SKILL_CATEGORY.BACKEND },
  { name: 'PHP', category: SKILL_CATEGORY.BACKEND },
  { name: 'Django', category: SKILL_CATEGORY.BACKEND },
  { name: 'Express.js', category: SKILL_CATEGORY.BACKEND },
  { name: 'FastAPI', category: SKILL_CATEGORY.BACKEND },
  
  // Design
  { name: 'Figma', category: SKILL_CATEGORY.DESIGN },
  { name: 'Adobe XD', category: SKILL_CATEGORY.DESIGN },
  { name: 'Sketch', category: SKILL_CATEGORY.DESIGN },
  { name: 'Adobe Photoshop', category: SKILL_CATEGORY.DESIGN },
  { name: 'Adobe Illustrator', category: SKILL_CATEGORY.DESIGN },
  { name: 'InVision', category: SKILL_CATEGORY.DESIGN },
  
  // DevOps
  { name: 'Docker', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Kubernetes', category: SKILL_CATEGORY.DEVOPS },
  { name: 'AWS', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Azure', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Google Cloud', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Terraform', category: SKILL_CATEGORY.DEVOPS },
  { name: 'Jenkins', category: SKILL_CATEGORY.DEVOPS },
  { name: 'GitLab CI', category: SKILL_CATEGORY.DEVOPS },
  
  // Mobile
  { name: 'React Native', category: SKILL_CATEGORY.MOBILE },
  { name: 'Flutter', category: SKILL_CATEGORY.MOBILE },
  { name: 'iOS Development', category: SKILL_CATEGORY.MOBILE },
  { name: 'Android Development', category: SKILL_CATEGORY.MOBILE },
  { name: 'Swift', category: SKILL_CATEGORY.MOBILE },
  { name: 'Kotlin', category: SKILL_CATEGORY.MOBILE },
  
  // Database
  { name: 'PostgreSQL', category: SKILL_CATEGORY.DATABASE },
  { name: 'MongoDB', category: SKILL_CATEGORY.DATABASE },
  { name: 'MySQL', category: SKILL_CATEGORY.DATABASE },
  { name: 'Redis', category: SKILL_CATEGORY.DATABASE },
  { name: 'Firebase', category: SKILL_CATEGORY.DATABASE },
  { name: 'Supabase', category: SKILL_CATEGORY.DATABASE }
];
