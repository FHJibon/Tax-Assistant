import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  // FastAPI runs on :8000 without '/api' prefix
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if a token exists (session expired/invalid),
      // avoid redirect loops for intentional 401s like invalid login.
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
          // Clear all cached user info to avoid stale UI
          localStorage.removeItem('userProfile')
          localStorage.removeItem('userEmail')
          localStorage.removeItem('userName')
          localStorage.removeItem('token')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
  // No backend endpoint required; handled client-side
  logout: () => Promise.resolve({ data: { message: 'logged out' } } as AxiosResponse),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (email: string, code: string, newPassword: string) =>
    api.post('/auth/reset-password', { email, code, new_password: newPassword }),

  verifySignup: (email: string, code: string) =>
    api.post('/auth/verify', { email, code }),

  me: () => api.get('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),

  deleteAccount: (confirm: boolean = true) =>
    api.post('/auth/delete-account', { confirm }),
}

export const taxAPI = {
  // Chat endpoints
  // Increase timeout for chat since LLM responses can take longer than 10s
  sendChatMessage: (message: string, topK: number = 5, timeoutMs: number = 30000) =>
    api.post('/chat/', { message, top_k: topK }, { timeout: timeoutMs }),
  getHistory: () => api.get('/chat/history'),
  terminateSession: () => api.post('/chat/terminate'),
}

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),
}

// Utility functions
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    }
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    }
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      data: null,
    }
  }
}

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}

export default api