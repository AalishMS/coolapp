import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Box, Paper, Typography, TextField, Button, InputAdornment, IconButton, Alert, Container, Chip } from '@mui/material'
import { Visibility, VisibilityOff, Email, Lock, Person, CheckCircle, Cancel } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useThemeContext } from '../../context/ThemeContext'

interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser, error: authError, clearError } = useAuth()
  const { mode } = useThemeContext()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline' | 'db_error'>('checking')

  useEffect(() => {
    checkServerStatus()
  }, [])

  const checkServerStatus = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      if (response.ok) {
        const data = await response.json()
        if (data.database === 'connected') {
          setServerStatus('online')
        } else {
          setServerStatus('db_error')
        }
      } else if (response.status === 503) {
        setServerStatus('db_error')
      } else {
        setServerStatus('offline')
      }
    } catch {
      setServerStatus('offline')
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>()

  const password = watch('password')

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const strength = getPasswordStrength(password || '')
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF']

  const onSubmit = async (data: RegisterForm) => {
    setLocalError(null)
    clearError()
    setLoading(true)

    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      })
    } catch (err: any) {
      const errorData = err.response?.data
      const status = err.response?.status
      
      if (status === 503) {
        setLocalError('Database connection unavailable. Please try again later.')
        setServerStatus('db_error')
      } else if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map((e: any) => `${e.field}: ${e.message}`).join('. ')
        setLocalError(errorMessages)
      } else if (errorData?.message) {
        setLocalError(errorData.message)
      } else if (err.message) {
        setLocalError(err.message)
      } else if (!navigator.onLine) {
        setLocalError('Cannot connect to server. Please check your internet connection.')
      } else {
        setLocalError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F5F5F7',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            border: mode === 'dark' ? '1px solid #38383A' : '1px solid #D2D2D7',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 600,
                color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F',
                mb: 1,
              }}
            >
              Create Account
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}
            >
              Join Inventory Management today
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Chip
                size="small"
                icon={serverStatus === 'online' ? <CheckCircle /> : <Cancel />}
                label={
                  serverStatus === 'checking' ? 'Checking server...' : 
                  serverStatus === 'online' ? 'Server online' : 
                  serverStatus === 'db_error' ? 'Database error' :
                  'Server offline'
                }
                color={serverStatus === 'online' ? 'success' : serverStatus === 'offline' || serverStatus === 'db_error' ? 'error' : 'default'}
                sx={{ borderRadius: 1 }}
              />
            </Box>
          </Box>

          {(authError || localError) && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => { setLocalError(null); clearError() }}>
              {authError || localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Full Name"
              type="text"
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#38383A' : '#D2D2D7',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#48484A' : '#007AFF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                    borderWidth: 2,
                  },
                },
              }}
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 50, message: 'Name must be less than 50 characters' },
              })}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#38383A' : '#D2D2D7',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#48484A' : '#007AFF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                    borderWidth: 2,
                  },
                },
              }}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Please enter a valid email',
                },
              })}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#38383A' : '#D2D2D7',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#48484A' : '#007AFF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                    borderWidth: 2,
                  },
                },
              }}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number',
                },
              })}
            />

            {password && password.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}>
                    Password strength:
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: strengthColors[strength - 1] }}
                  >
                    {strengthLabels[strength - 1]}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: i <= strength ? strengthColors[i - 1] : 'transparent',
                        border: `1px solid ${mode === 'dark' ? '#38383A' : '#D2D2D7'}`,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& fieldset': {
                    borderColor: mode === 'dark' ? '#38383A' : '#D2D2D7',
                  },
                  '&:hover fieldset': {
                    borderColor: mode === 'dark' ? '#48484A' : '#007AFF',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#007AFF',
                    borderWidth: 2,
                  },
                },
              }}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || serverStatus === 'offline' || serverStatus === 'db_error'}
              sx={{
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'none',
                backgroundColor: '#007AFF',
                '&:hover': {
                  backgroundColor: '#0056CC',
                  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                },
                '&:disabled': {
                  backgroundColor: mode === 'dark' ? '#48484A' : '#D2D2D7',
                },
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}>
              Already have an account?{' '}
              <Link
                to="/"
                style={{
                  color: '#007AFF',
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${mode === 'dark' ? '#38383A' : '#D2D2D7'}` }}>
            <Typography variant="caption" sx={{ color: mode === 'dark' ? '#FF9500' : '#ED6C02', display: 'block', mt: 1 }}>
              Important: Start MongoDB and the backend server before registering
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Register
