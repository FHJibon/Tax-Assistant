import axios, { AxiosInstance, AxiosResponse } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      const headers: any = config.headers || {}
      try {
        if (headers && typeof headers.delete === 'function') {
          headers.delete('Content-Type')
        }
      } catch {
      }
      if (headers) {
        delete headers['Content-Type']
        delete headers['content-type']
        if (headers.common) {
          delete headers.common['Content-Type']
          delete headers.common['content-type']
        }
      }
      config.headers = headers
    }

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

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token')
        if (token) {
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

export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string }) =>
    api.post('/auth/register', userData),
  
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
  sendChatMessage: (
    message: string,
    topK: number = 5,
    timeoutMs: number = 30000,
    voiceTranscript?: string | null
  ) =>
    api.post(
      '/chat/',
      { message, top_k: topK, voice_transcript: voiceTranscript || undefined },
      { timeout: timeoutMs }
    ),
  getHistory: () => api.get('/chat/history'),
  terminateSession: () => api.post('/chat/terminate'),
  generateTaxReturn: (timeoutMs: number = 60000) =>
    api.get('/generate/tax-return', { responseType: 'blob', timeout: timeoutMs }),
  generateTaxReturnFromForm: (payload: any, timeoutMs: number = 60000) =>
    api.post('/generate/tax-return', payload, { responseType: 'blob', timeout: timeoutMs }),
}

export const speechAPI = {
  transcribe: (audioBlob: Blob, filename: string = 'voice.webm', timeoutMs: number = 120000) => {
    const form = new FormData()
    form.append('audio', audioBlob, filename)
    return api.post('/speech/transcribe', form, { timeout: timeoutMs })
  },
}

export const uploadAPI = {
  getStatus: () => api.get('/upload/status'),
}

export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
  updateProfile: (profileData: any) =>
    api.put('/user/profile', profileData),
}

export const handleApiError = (error: any) => {
  if (error.response) {
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      data: error.response.data,
    }
  } else if (error.request) {
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      data: null,
    }
  } else {
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