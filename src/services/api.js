const API_BASE_URL = 'http://localhost:5003/api';

class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
  }

  // Get auth headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Get token from localStorage
    const token = localStorage.getItem('skillswap_token');
    console.log('🔑 getAuthHeaders - token from localStorage:', token ? 'Token exists' : 'No token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 getAuthHeaders - Authorization header set');
    } else {
      console.log('🔑 getAuthHeaders - No token found, skipping Authorization header');
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    console.log(`🌐 Making request to: ${url}`);
    console.log(`🌐 Request config:`, { method: config.method || 'GET', headers: config.headers });

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log(`🌐 Response status: ${response.status}`);
      console.log(`🌐 Response data:`, data);

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        console.error(`❌ API request failed for ${endpoint}:`, errorMessage);
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`❌ API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyToken() {
    return this.request('/auth/verify');
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/profile');
  }

  // Get other user's profile (if endpoint exists)
  async getOtherUserProfile(userId) {
    return this.request(`/profile/${userId}`);
  }

  // User methods
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/users?${queryParams}` : '/users';
    return this.request(endpoint);
  }

  async updateProfile(userData) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Profile skills methods
  async addOfferedSkill(skillData) {
    return this.request('/profile/skills/offered', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async deleteOfferedSkill(skillId) {
    return this.request(`/profile/skills/offered/${skillId}`, {
      method: 'DELETE',
    });
  }

  async addWantedSkill(skillData) {
    return this.request('/profile/skills/wanted', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  async deleteWantedSkill(skillId) {
    return this.request(`/profile/skills/wanted/${skillId}`, {
      method: 'DELETE',
    });
  }

  // Get user skills (if you have a specific endpoint for this)
  async getUserSkills(userId) {
    return this.request(`/profile/skills`);
  }

  // Match methods
  async getMatches() {
    return this.request('/match');
  }

  // Alternative method to try different endpoints
  async getMatchesAlternative() {
    try {
      return await this.request('/match');
    } catch (error) {
      console.log('⚠️ /match failed, trying /matches...');
      try {
        return await this.request('/matches');
      } catch (error2) {
        console.log('⚠️ /matches failed, trying /users...');
        return await this.request('/users');
      }
    }
  }

  // Rating methods
  async submitRating(userId, rating, comment) {
    const commentText = comment || '';
    return this.request('/rating', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        rating,
        comment: commentText,
      }),
    });
  }

  // async getUserRating(userId) {
  //   return this.request(`/rating/${userId}`);
  // }

  // Chat methods (kept for compatibility, but Supabase handles real-time)
  async getConversations() {
    try {
      return this.request('/chat/conversations');
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      throw error;
    }
  }

  async getChatHistory(conversationId) {
    try {
      return this.request(`/chat/conversations/${conversationId}/messages`);
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId) {
    try {
      return this.request(`/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
      throw error;
    }
  }

  async sendMessage(conversationId, message) {
    try {
      return this.request(`/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: message }),
      });
    } catch (error) {
      console.error('❌ Error sending message:', error);
      throw error;
    }
  }
}

export default new ApiService();
