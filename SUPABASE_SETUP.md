# Supabase Chat Integration Setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration (if still using REST API for other features)
VITE_API_URL=http://localhost:5003/api
```

## Database Setup

### 1. Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Create chats table
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id),
  user2_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for chats table
CREATE TRIGGER update_chats_updated_at 
  BEFORE UPDATE ON chats 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Enable Row Level Security (RLS)

```sql
-- Enable RLS on tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chats table
CREATE POLICY "Users can view their own chats" ON chats
  FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Users can insert their own chats" ON chats
  FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- Create policies for messages table
CREATE POLICY "Users can view messages in their chats" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = messages.chat_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert messages in their chats" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE id = messages.chat_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());
```

### 3. Enable Realtime

In your Supabase dashboard:
1. Go to Database → Replication
2. Enable realtime for both `chats` and `messages` tables

## Features

### ✅ Real-time Messaging
- Messages are sent and received in real-time using Supabase's realtime subscriptions
- No need for custom WebSocket implementation

### ✅ Message Persistence
- All messages are stored in PostgreSQL database
- Messages persist across sessions and devices

### ✅ Read Receipts
- Messages can be marked as read
- Read status is synchronized in real-time

### ✅ Chat Management
- Automatic chat creation between users
- Chat list with last message and unread counts

### ✅ Security
- Row Level Security (RLS) ensures users can only access their own chats
- Proper authentication and authorization

## Usage

The chat system now uses Supabase for:
- Real-time message delivery
- Message persistence
- User authentication (if using Supabase Auth)
- Automatic chat creation
- Read receipts

All chat operations are now handled through the `supabaseChatService` which provides a clean interface to the Supabase backend.
