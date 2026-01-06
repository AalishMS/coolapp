import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

// Normalize API URL - ensure it ends with /api
const getApiUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    // If URL ends with /api, use it as is
    if (envUrl.endsWith('/api')) {
      return envUrl
    }
    // If URL doesn't end with /api, append it
    return envUrl.replace(/\/$/, '') + '/api'
  }
  // Default fallback - use relative URL for proxy or absolute for dev
  return '/api'
}

const API_URL = getApiUrl()

const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; csrf_token=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

api.interceptors.request.use(
  (config) => {
    const csrfToken = getCsrfToken()
    if (csrfToken) {
      config.headers['x-csrf-token'] = csrfToken
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const response = await api.post('/auth/refresh')
        const { accessToken, csrfToken } = response.data.data

        if (accessToken) {
          if (csrfToken && originalRequest.headers) {
            originalRequest.headers['x-csrf-token'] = csrfToken
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
