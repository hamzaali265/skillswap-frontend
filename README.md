# SkillSwap Frontend

A modern React application for the SkillSwap platform, where developers can exchange skills and connect with each other.

## 🚀 Features

- **User Authentication** - Secure login and registration
- **User Profiles** - Detailed profiles with skills offered and wanted
- **Skill Matching** - Find users based on skill compatibility
- **Real-time Chat** - Instant messaging powered by Supabase Realtime
- **Rating System** - Rate and review other users
- **Responsive Design** - Modern UI built with Tailwind CSS

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Supabase** - Real-time database and authentication
- **Context API** - State management

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillswap-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5003/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Supabase Setup

The chat system requires Supabase to be properly configured. See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.

### Quick Setup:
1. Create a Supabase project
2. Run the SQL scripts in the Supabase SQL Editor
3. Enable Row Level Security and Realtime
4. Add your Supabase credentials to `.env`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── features/       # Feature-specific components
│   │   ├── auth/       # Authentication components
│   │   └── layout/     # Layout components
│   └── ui/            # Base UI components
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── pages/             # Page components
├── services/          # API and external services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Key Features

### Real-time Chat
- **Supabase Realtime** - Instant message delivery
- **Message History** - Persistent chat history
- **Read Receipts** - Track message read status
- **Typing Indicators** - Real-time typing feedback

### User Management
- **Profile Management** - Update skills and preferences
- **Skill Matching** - Find compatible users
- **Rating System** - Rate and review other users

### Modern UI/UX
- **Responsive Design** - Works on all devices
- **Dark/Light Mode** - Theme support
- **Smooth Animations** - Enhanced user experience
- **Accessibility** - WCAG compliant

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
