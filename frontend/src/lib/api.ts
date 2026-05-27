import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trains API
export const trainsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/trains');
    return response.data;
  },
  search: async (source: string, destination: string) => {
    const response = await apiClient.get('/api/trains/search', {
      params: { source, destination },
    });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await apiClient.get(`/api/trains/${id}`);
    return response.data;
  },
};

// Auth API
export const authAPI = {
  register: async (data: any) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

export default apiClient;
