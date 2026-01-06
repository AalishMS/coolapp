import api from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'manager'
  createdAt: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken?: string
    csrfToken: string
  }
  message?: string
}

export interface UserResponse {
  success: boolean
  data: {
    user: User
  }
}

export interface UpdateProfileData {
  name?: string
  email?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getMe(): Promise<UserResponse> {
    const response = await api.get('/auth/me')
    return response.data
  },

  async refreshToken(): Promise<{ data: { accessToken: string } }> {
    const response = await api.post('/auth/refresh')
    return response.data
  },

  async checkStatus(): Promise<{ data: { hasAccessToken: boolean; hasRefreshToken: boolean; isAuthenticated: boolean } }> {
    const response = await api.get('/auth/status')
    return response.data
  },
}

export const userService = {
  async getProfile(): Promise<UserResponse> {
    const response = await api.get('/users/profile')
    return response.data
  },

  async updateProfile(data: UpdateProfileData): Promise<UserResponse> {
    const response = await api.put('/users/profile', data)
    return response.data
  },

  async changePassword(data: ChangePasswordData): Promise<{ data: { accessToken: string } }> {
    const response = await api.put('/users/password', data)
    return response.data
  },

  async deleteAccount(confirmEmail: string): Promise<void> {
    await api.delete('/users/profile', { data: { confirmEmail } })
  },
}
