import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  Avatar,
} from '@mui/material'
import {
  Person,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Edit,
  Save,
  Cancel,
  Delete,
  Warning,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useThemeContext } from '../../context/ThemeContext'

interface EditNameForm {
  name: string
}

interface ChangePasswordForm {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

const Profile = () => {
  const { user, updateProfile, changePassword, deleteAccount, error: authError, clearError } = useAuth()
  const { mode } = useThemeContext()
  const [editingName, setEditingName] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteEmail, setDeleteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register: registerName,
    handleSubmit: handleSubmitName,
    setValue: setNameValue,
    formState: { errors: nameErrors },
  } = useForm<EditNameForm>()

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>()

  const newPassword = watch('newPassword')

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[a-z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const strength = getPasswordStrength(newPassword || '')
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF']

  const handleEditName = () => {
    if (user) {
      setNameValue('name', user.name)
      setEditingName(true)
    }
  }

  const onSubmitName = async (data: EditNameForm) => {
    setLoading(true)
    setLocalError(null)
    clearError()
    try {
      await updateProfile({ name: data.name })
      setSuccessMessage('Name updated successfully')
      setEditingName(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setLocalError(err.message || 'Failed to update name')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPassword = async (data: ChangePasswordForm) => {
    setLoading(true)
    setLocalError(null)
    clearError()
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setSuccessMessage('Password changed successfully')
      resetPassword()
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setLocalError(err.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user?.email) {
      setLocalError('Email does not match')
      return
    }

    setLoading(true)
    setLocalError(null)
    try {
      await deleteAccount(deleteEmail)
    } catch (err: any) {
      setLocalError(err.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: mode === 'dark' ? '#1C1C1E' : '#F5F5F7',
        p: 3,
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F',
            mb: 1,
          }}
        >
          Profile
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B', mb: 4 }}
        >
          Manage your account settings and preferences
        </Typography>

        {(authError || localError) && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => { setLocalError(null); clearError() }}>
            {authError || localError}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            border: mode === 'dark' ? '1px solid #38383A' : '1px solid #D2D2D7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: '#007AFF',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {initials || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {editingName ? (
                <Box component="form" onSubmit={handleSubmitName(onSubmitName)} sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    {...registerName('name', {
                      required: 'Name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      maxLength: { value: 50, message: 'Name must be less than 50 characters' },
                    })}
                    error={!!nameErrors.name}
                    helperText={nameErrors.name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2 },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="small"
                    startIcon={<Save />}
                    disabled={loading}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => setEditingName(false)}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <>
                  <Typography variant="h6" sx={{ color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F' }}>
                    {user?.name || 'User'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }}>
                    {user?.email}
                  </Typography>
                </>
              )}
            </Box>
            {!editingName && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEditName}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  borderColor: mode === 'dark' ? '#48384A' : '#D2D2D7',
                  color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F',
                }}
              >
                Edit
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 2, borderColor: mode === 'dark' ? '#38383A' : '#D2D2D7' }} />

          <Typography variant="subtitle2" sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B', mb: 2 }}>
            Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
          </Typography>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            border: mode === 'dark' ? '1px solid #38383A' : '1px solid #D2D2D7',
          }}
        >
          <Typography variant="h6" sx={{ color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F', mb: 3 }}>
            Change Password
          </Typography>

          <Box component="form" onSubmit={handleSubmitPassword(onSubmitPassword)} sx={{ maxWidth: 400 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              error={!!passwordErrors.currentPassword}
              helperText={passwordErrors.currentPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...registerPassword('currentPassword', { required: 'Current password is required' })}
            />

            <TextField
              fullWidth
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...registerPassword('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Password must contain uppercase, lowercase, and number',
                },
              })}
            />

            {newPassword && newPassword.length > 0 && (
              <Box sx={{ mb: 2 }}>
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
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              {...registerPassword('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match',
              })}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                backgroundColor: '#007AFF',
                '&:hover': {
                  backgroundColor: '#0056CC',
                  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                },
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </Button>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            border: mode === 'dark' ? '1px solid #38383A' : '1px solid #D2D2D7',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ color: mode === 'dark' ? '#FFFFFF' : '#1D1D1F' }}>
                Delete Account
              </Typography>
              <Typography variant="body2" sx={{ color: mode === 'dark' ? '#8E8E93' : '#86868B', mt: 0.5 }}>
                Permanently delete your account and all data
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#FF3B30',
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                },
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Paper>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              backgroundColor: mode === 'dark' ? '#2C2C2E' : '#FFFFFF',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning sx={{ color: '#FF3B30' }} />
            Delete Account
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              This action is permanent and cannot be undone. All your data will be permanently deleted.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: mode === 'dark' ? '#8E8E93' : '#86868B' }}>
              To confirm, please enter your email address:
            </Typography>
            <TextField
              fullWidth
              label="Email"
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteEmail('')
              }}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAccount}
              disabled={loading || deleteEmail !== user?.email}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#D70015',
                },
              }}
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default Profile
