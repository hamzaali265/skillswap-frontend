# Firebase Setup Guide

## 1. Firebase Project Configuration

Your Firebase project ID is: `skillswap-fc56c`

## 2. Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_web_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=skillswap-fc56c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skillswap-fc56c
VITE_FIREBASE_STORAGE_BUCKET=skillswap-fc56c.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

## 3. Get Firebase Web Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `skillswap-fc56c`
3. Click on the gear icon (⚙️) next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click "Add app" and select "Web" (</>) if you haven't already
7. Copy the configuration object

## 4. Firestore Database Setup

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location (choose the closest to your users)

## 5. Firestore Security Rules

Update your Firestore security rules to allow chat functionality:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own chats
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (resource.data.user1_id == request.auth.uid || 
         resource.data.user2_id == request.auth.uid);
      
      // Allow access to messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          (get(/databases/$(database)/documents/chats/$(chatId)).data.user1_id == request.auth.uid || 
           get(/databases/$(database)/documents/chats/$(chatId)).data.user2_id == request.auth.uid);
      }
    }
    
    // Allow typing indicators
    match /typing/{typingId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Collection Structure

The chat system will create these collections:

- `chats` - Chat documents
- `chats/{chatId}/messages` - Messages subcollection
- `typing` - Typing indicators

## 7. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to the chat page
3. Try sending a message
4. Check Firebase Console to see if data is being created

## 8. Troubleshooting

If you encounter issues:

1. Check browser console for Firebase errors
2. Verify your environment variables are set correctly
3. Ensure Firestore is enabled in your Firebase project
4. Check that security rules allow the operations you're trying to perform

## 9. Production Deployment

For production:

1. Update Firestore security rules to be more restrictive
2. Set up proper authentication
3. Configure Firebase hosting if needed
4. Set up proper environment variables in your hosting platform
