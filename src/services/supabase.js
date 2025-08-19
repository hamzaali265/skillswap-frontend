import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Chat table structure (for reference):
// CREATE TABLE chats (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user1_id UUID REFERENCES auth.users(id),
//   user2_id UUID REFERENCES auth.users(id),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// CREATE TABLE messages (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
//   sender_id UUID REFERENCES auth.users(id),
//   content TEXT NOT NULL,
//   is_read BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

// Enable Row Level Security (RLS) policies:
// CREATE POLICY "Users can view their own chats" ON chats
//   FOR SELECT USING (user1_id = auth.uid() OR user2_id = auth.uid());

// CREATE POLICY "Users can insert their own chats" ON chats
//   FOR INSERT WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

// CREATE POLICY "Users can view messages in their chats" ON messages
//   FOR SELECT USING (
//     EXISTS (
//       SELECT 1 FROM chats 
//       WHERE id = messages.chat_id 
//       AND (user1_id = auth.uid() OR user2_id = auth.uid())
//     )
//   );

// CREATE POLICY "Users can insert messages in their chats" ON messages
//   FOR INSERT WITH CHECK (
//     EXISTS (
//       SELECT 1 FROM chats 
//       WHERE id = messages.chat_id 
//       AND (user1_id = auth.uid() OR user2_id = auth.uid())
//     )
//   );

// CREATE POLICY "Users can update their own messages" ON messages
//   FOR UPDATE USING (sender_id = auth.uid());

export default supabase;
