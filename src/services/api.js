const API_BASE_URL = 'http://localhost:5003/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('skillswap_token');
    console.log('🔑 getAuthHeaders - token from localStorage:', token);

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    console.log('📌 getAuthHeaders - final headers:', headers);
    return headers;
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        `❌ API error - status: ${response.status}, data:`,
        data
      );
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Authentication APIs
  async register(formData) {
    console.log('📨 API register called with FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }
  
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      body: formData, // ✅ send FormData directly
      // ❌ do not set Content-Type manually, fetch will handle multipart boundaries
    });
  
    return this.handleResponse(response);
  }
  
  async login(credentials) {
    console.log('📨 API login called with:', credentials);
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return this.handleResponse(response);
  }

  async verifyToken() {
    const headers = this.getAuthHeaders();
    console.log('🔍 verifyToken - calling with headers:', headers);

    const response = await fetch(`${this.baseURL}/auth/verify`, {
      method: 'GET',
      headers,
    });

    console.log('🔍 verifyToken - response status:', response.status);
    return this.handleResponse(response);
  }

  async logout() {
    console.log('🚪 API logout called');
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Profile APIs
  async getProfile() {
    console.log('👤 API getProfile called');
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateProfile(profileData) {
    console.log('📝 API updateProfile called with:', profileData);
    const response = await fetch(`${this.baseURL}/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async addOfferedSkill(skillData) {
    console.log('➕ API addOfferedSkill called with:', skillData);
    const response = await fetch(`${this.baseURL}/profile/skills/offered`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async deleteOfferedSkill(skillId) {
    console.log('🗑️ API deleteOfferedSkill called with id:', skillId);
    const response = await fetch(`${this.baseURL}/profile/skills/offered/${skillId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async addWantedSkill(skillData) {
    console.log('➕ API addWantedSkill called with:', skillData);
    const response = await fetch(`${this.baseURL}/profile/skills/wanted`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(skillData),
    });
    return this.handleResponse(response);
  }

  async deleteWantedSkill(skillId) {
    console.log('🗑️ API deleteWantedSkill called with id:', skillId);
    const response = await fetch(`${this.baseURL}/profile/skills/wanted/${skillId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  // Matching APIs
  async getMatches() {
    console.log('🔍 API getMatches called');
    const response = await fetch(`${this.baseURL}/match`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getMatchDetails(userId) {
    console.log('🔍 API getMatchDetails called with userId:', userId);
    console.log('🔍 API getMatchDetails URL:', `${this.baseURL}/match/${userId}`);
    const response = await fetch(`${this.baseURL}/match/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    console.log('🔍 API getMatchDetails response status:', response.status);
    const result = await this.handleResponse(response);
    console.log('🔍 API getMatchDetails result:', result);
    return result;
  }

  // Chat APIs
  async getConversations() {
    console.log('💬 API getConversations called');
    const response = await fetch(`${this.baseURL}/chat/conversations`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async getChatHistory(userId) {
    console.log('💬 API getChatHistory called with userId:', userId);
    const response = await fetch(`${this.baseURL}/chat/history/${userId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async markMessagesAsRead(userId) {
    console.log('✅ API markMessagesAsRead called with userId:', userId);
    const response = await fetch(`${this.baseURL}/chat/mark-read/${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
