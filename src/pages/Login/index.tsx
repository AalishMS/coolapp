import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Box, Paper, Typography, TextField, Button, Alert, Container } from '@mui/material'
import { useThemeContext } from '../../context/ThemeContext'

interface User {
  email: string
  name: string
}

const Login = () => {
  const navigate = useNavigate()
  const { mode } = useThemeContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const userStr = localStorage.getItem('user')
  if (userStr) {
    const user = JSON.parse(userStr) as User
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    await new Promise((r) => setTimeout(r, 500))

    if (email && password) {
      const user: User = {
        email,
        name: email.split('@')[0],
      }
      localStorage.setItem('user', JSON.stringify(user))
      navigate('/dashboard')
    } else {
      setError('Please enter email and password')
    }
    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: mode === 'dark' ? '#121212' : '#F5F5F5',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            Inventory
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Demo: enter any email and password
          </Typography>
        </Paper>
      </Container>
    </Box>
  )
}

export default Login
