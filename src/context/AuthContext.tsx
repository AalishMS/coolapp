import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, userService, User, RegisterData, LoginData, UpdateProfileData, ChangePasswordData } from '../services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  csrfToken: string | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  changePassword: (data: ChangePasswordData) => Promise<void>
  deleteAccount: (confirmEmail: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [csrfToken, setCsrfToken] = useState<string | null>(null)
  const navigate = useNavigate()

  const loadUser = useCallback(async () => {
    const accessToken = getCookie('accessToken')
    if (accessToken) {
      try {
        const response = await authService.getMe()
        setUser(response.data.user)
      } catch {
        deleteCookie('accessToken')
        deleteCookie('refreshToken')
        deleteCookie('csrf_token')
        deleteCookie('csrf_token_hash')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const login = async (data: LoginData): Promise<void> => {
    try {
      setError(null)
      const response = await authService.login(data)
      const { user, csrfToken } = response.data
      setUser(user)
      setCsrfToken(csrfToken)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      throw new Error(message)
    }
  }

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setError(null)
      const response = await authService.register(data)
      const { user, csrfToken } = response.data
      setUser(user)
      setCsrfToken(csrfToken)
      navigate('/dashboard')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed'
      setError(message)
      throw new Error(message)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
    } catch {
      // Ignore logout errors
    } finally {
      deleteCookie('accessToken')
      deleteCookie('refreshToken')
      deleteCookie('csrf_token')
      deleteCookie('csrf_token_hash')
      setUser(null)
      setCsrfToken(null)
      navigate('/')
    }
  }

  const updateProfile = async (data: UpdateProfileData): Promise<void> => {
    try {
      setError(null)
      const response = await userService.updateProfile(data)
      setUser(response.data.user)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Update failed'
      setError(message)
      throw new Error(message)
    }
  }

  const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
      setError(null)
      await userService.changePassword(data)
    } catch (err: any) {
      const message = err.response?.data?.message || 'Password change failed'
      setError(message)
      throw new Error(message)
    }
  }

  const deleteAccount = async (confirmEmail: string): Promise<void> => {
    try {
      setError(null)
      await userService.deleteAccount(confirmEmail)
      deleteCookie('accessToken')
      deleteCookie('refreshToken')
      deleteCookie('csrf_token')
      deleteCookie('csrf_token_hash')
      setUser(null)
      setCsrfToken(null)
      navigate('/')
    } catch (err: any) {
      const message = err.response?.data?.message || 'Account deletion failed'
      setError(message)
      throw new Error(message)
    }
  }

  const clearError = (): void => {
    setError(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        csrfToken,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
