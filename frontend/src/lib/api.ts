import axios from 'axios';
import { Train } from '@/data/trains';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  refreshQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else if (token) {
      p.resolve(token);
    }
  });
  refreshQueue = [];
};

const getNewTokens = async (): Promise<{ access_token: string; refresh_token: string }> => {
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
  if (!refreshToken) {
    throw new Error('No refresh token');
  }
  const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
    refresh_token: refreshToken,
  });
  return response.data;
};

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/api/auth/refresh') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      try {
        const data = await getNewTokens();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        processQueue(null, data.access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Trains API
export interface StationSuggestions {
  sources: string[];
  destinations: string[];
  stations: string[];
}

export const trainsAPI = {
  getAll: async (): Promise<Train[]> => {
    const response = await apiClient.get('/api/trains');
    return response.data;
  },
  getStations: async (): Promise<StationSuggestions> => {
    const response = await apiClient.get('/api/trains/stations');
    return response.data;
  },
  search: async (source: string, destination: string): Promise<Train[]> => {
    const response = await apiClient.get('/api/trains/search', {
      params: { source, destination },
    });
    return response.data;
  },
  getById: async (id: number): Promise<Train> => {
    const response = await apiClient.get(`/api/trains/${id}`);
    return response.data;
  },
};

let stationSuggestionsRequest: Promise<StationSuggestions> | null = null;

export function loadStationSuggestions(): Promise<StationSuggestions> {
  stationSuggestionsRequest ??= trainsAPI.getStations();
  return stationSuggestionsRequest;
}

// Auth API
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
    created_at: string;
  };
}

export const authAPI = {
  register: async (data: RegisterData): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  googleLogin: async (token: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/google-login', {
      token,
    });
    return response.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.get('/api/auth/logout');
  },
  getCurrentUser: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};

// Bookings API
export interface BookingCreateData {
  train_id: number;
  journey_date: string;
  seat_class: string;
  num_passengers: number;
  passenger_names: string;
}

export interface BookingResponse {
  id: number;
  pnr: string;
  journey_date: string;
  seat_class: string;
  num_passengers: number;
  total_fare: number;
  status: string;
  passenger_names: string;
  wl_number: number | null;
  created_at: string;
  train: import('@/data/trains').Train;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_admin: boolean;
    created_at: string;
  };
}

export const bookingsAPI = {
  create: async (data: BookingCreateData): Promise<BookingResponse> => {
    const response = await apiClient.post('/api/bookings', data);
    return response.data;
  },
  getMyBookings: async (): Promise<BookingResponse[]> => {
    const response = await apiClient.get('/api/bookings/my');
    return response.data;
  },
  checkPNR: async (pnr: string): Promise<BookingResponse> => {
    const response = await apiClient.get(`/api/bookings/pnr/${pnr}`);
    return response.data;
  },
  cancel: async (bookingId: number): Promise<{ message: string; pnr: string }> => {
    const response = await apiClient.delete(`/api/bookings/${bookingId}`);
    return response.data;
  },
};

export default apiClient;
