# SkillSwap - React Frontend

A modern, responsive React web application for SkillSwap - a micro skill-trading platform where developers can exchange skills.

## 🚀 Features

### Core Functionality
- **User Authentication** - Login/Register with JWT token management
- **Profile Management** - Edit profile, manage skills offered/wanted
- **Matchmaking System** - Find users with complementary skills
- **Real-time Chat** - Modern chat interface with message bubbles
- **Dashboard** - Overview of matches, stats, and recent activity

### UI/UX Features
- **Responsive Design** - Mobile-first approach with breakpoint optimization
- **Modern Design System** - Custom Tailwind CSS with consistent components
- **Smooth Animations** - Hover effects, transitions, and micro-interactions
- **Loading States** - Skeleton loaders and loading spinners
- **Toast Notifications** - Success/error feedback with React Hot Toast

### Technical Features
- **State Management** - Context API + useReducer for global state
- **Custom Hooks** - Reusable authentication and API hooks
- **Form Validation** - React Hook Form with comprehensive validation
- **Mock API** - Simulated backend with realistic data
- **Real-time Simulation** - WebSocket-like behavior for chat

## 🛠 Tech Stack

- **React 18** - Latest React with modern features
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Router v6** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Toast notifications
- **Vite** - Fast build tool and dev server

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   └── LoadingSpinner.jsx
│   ├── layout/             # Layout components
│   │   ├── Header.jsx
│   │   └── Layout.jsx
│   └── features/           # Feature-specific components
│       ├── auth/
│       │   ├── LoginForm.jsx
│       │   └── RegisterForm.jsx
│       ├── profile/
│       ├── matches/
│       └── chat/
├── contexts/
│   └── AppContext.jsx      # Global state management
├── hooks/
│   ├── useAuth.js          # Authentication logic
│   └── useApi.js           # API calls and mock data
├── types/
│   └── index.js            # Data structures and mock data
├── utils/
│   └── helpers.js          # Utility functions
├── pages/                  # Page components
│   ├── Dashboard.jsx
│   ├── Matches.jsx
│   ├── Chat.jsx
│   └── Profile.jsx
├── App.jsx                 # Main app component
└── main.jsx               # Entry point
```

## 🎨 Design System

### Colors
- **Primary**: Indigo gradient (#6366F1 to #4338CA)
- **Secondary**: Orange, Yellow, Green, Blue, Pink variants
- **Gray Scale**: 50-900 range for text and backgrounds

### Components
- **Buttons**: Primary, secondary, ghost, outline, danger variants
- **Cards**: Default, compact, glass, gradient variants
- **Badges**: Default, offered, wanted, success, warning, error, info
- **Inputs**: Text inputs with validation states and icons
- **Avatars**: User avatars with online status indicators

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 400, 500, 600, 700
- **Sizes**: Responsive text sizing with Tailwind classes

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillswap-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🔐 Authentication

The app uses mock authentication for development:

### Login Credentials
- **Email**: Any valid email format
- **Password**: Any password (6+ characters)

### Features
- JWT token simulation
- Protected routes
- Automatic redirects
- Persistent login state

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Hamburger menu navigation
- Touch-friendly interactions
- Optimized chat interface
- Responsive card layouts

## 🎯 Key Features Explained

### Matchmaking Algorithm
- Calculates match percentage based on skill compatibility
- Considers skills offered vs skills wanted
- Shows common skills between users
- Filters by skill category and level

### Real-time Chat
- Simulated real-time messaging
- Message timestamps and read receipts
- Online status indicators
- Mobile-responsive chat interface

### Profile Management
- Edit personal information
- Add/remove skills with search
- Skill level management
- Profile completion tracking

## 🧪 Mock Data

The app includes comprehensive mock data:

- **20+ Sample Users** with diverse skills and locations
- **Various Skill Combinations** across different categories
- **Realistic Chat Conversations** with timestamps
- **Match Scenarios** with different percentages

## 🔧 Customization

### Adding New Skills
Edit `src/types/index.js` to add new skills to the `availableSkills` array.

### Styling Changes
Modify `tailwind.config.js` for design system changes or `src/index.css` for custom component classes.

### Mock Data
Update mock data in `src/types/index.js` to change user profiles, matches, and chat data.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag and drop the `dist` folder
- **AWS S3**: Upload build files to S3 bucket
- **Any Static Host**: The app builds to static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **React Community** for the amazing ecosystem
- **Unsplash** for the sample user avatars

---

Built with ❤️ using React and Tailwind CSS
# skillswap-frontend
