import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar, Divider, ListItemIcon } from '@mui/material'
import {
  Menu as MenuIcon,
  AccountCircle,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
} from '@mui/icons-material'
import { useThemeContext } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  onMenuClick: () => void
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate()
  const { mode, toggleTheme } = useThemeContext()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    handleMenuClose()
    navigate(path)
  }

  const handleLogout = async () => {
    handleMenuClose()
    await logout()
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: mode === 'dark' 
            ? 'rgba(13, 17, 23, 0.85)' 
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(48, 54, 61, 0.8)' 
            : '1px solid rgba(0, 113, 227, 0.1)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <IconButton
            aria-label="open drawer"
            onClick={onMenuClick}
            edge="start"
            sx={{ 
              marginRight: 2,
              color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F',
              backgroundColor: mode === 'dark' 
                ? 'rgba(41, 151, 255, 0.1)' 
                : 'rgba(0, 113, 227, 0.08)',
              borderRadius: '12px',
              width: 42,
              height: 42,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(41, 151, 255, 0.2)' 
                  : 'rgba(0, 113, 227, 0.15)',
                transform: 'scale(1.05)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #2997FF 0%, #64D2FF 100%)'
                  : 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: mode === 'dark'
                  ? '0 4px 12px rgba(41, 151, 255, 0.3)'
                  : '0 4px 12px rgba(0, 113, 227, 0.25)',
              }}
            >
              <Typography 
                sx={{ 
                  color: '#fff', 
                  fontWeight: 700, 
                  fontSize: '14px',
                  letterSpacing: '-0.02em',
                }}
              >
                IM
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600, 
                fontSize: '1.125rem',
                letterSpacing: '-0.02em',
                color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F',
              }}
            >
              Inventory
            </Typography>
          </Box>

          {/* Theme Toggle */}
          <IconButton
            onClick={toggleTheme}
            sx={{
              mr: 1.5,
              color: mode === 'dark' ? '#8B949E' : '#6E6E73',
              backgroundColor: mode === 'dark' 
                ? 'rgba(139, 148, 158, 0.1)' 
                : 'rgba(110, 110, 115, 0.08)',
              borderRadius: '12px',
              width: 42,
              height: 42,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: mode === 'dark' 
                  ? 'rgba(139, 148, 158, 0.2)' 
                  : 'rgba(110, 110, 115, 0.15)',
                color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F',
              },
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* User Avatar */}
          <IconButton
            onClick={handleMenuOpen}
            sx={{ 
              p: 0.5,
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s ease',
            }}
          >
            <Avatar 
              sx={{ 
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #2997FF 0%, #64D2FF 100%)'
                  : 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                width: 40, 
                height: 40, 
                fontSize: '0.9rem', 
                fontWeight: 600,
                boxShadow: mode === 'dark'
                  ? '0 4px 12px rgba(41, 151, 255, 0.25)'
                  : '0 4px 12px rgba(0, 113, 227, 0.2)',
              }}
            >
              {initials || <AccountCircle />}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            width: 260,
            mt: 1.5,
            borderRadius: '16px',
            boxShadow: mode === 'dark' 
              ? '0 12px 40px rgba(0,0,0,0.5)' 
              : '0 12px 40px rgba(0, 113, 227, 0.15)',
            backgroundColor: mode === 'dark' ? '#161B22' : '#FFFFFF',
            border: mode === 'dark' 
              ? '1px solid rgba(48, 54, 61, 0.8)' 
              : '1px solid rgba(0, 113, 227, 0.1)',
            overflow: 'hidden',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* User Info Header */}
        <Box 
          sx={{ 
            px: 2.5, 
            py: 2,
            background: mode === 'dark'
              ? 'linear-gradient(135deg, rgba(41, 151, 255, 0.1) 0%, rgba(100, 210, 255, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(0, 113, 227, 0.06) 0%, rgba(90, 200, 250, 0.04) 100%)',
          }}
        >
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            sx={{ 
              color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F',
              fontSize: '1rem',
              letterSpacing: '-0.01em',
            }}
          >
            {user?.name || 'User'}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: mode === 'dark' ? '#8B949E' : '#6E6E73',
              fontSize: '0.875rem',
            }}
          >
            {user?.email}
          </Typography>
        </Box>
        
        <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(48, 54, 61, 0.8)' : 'rgba(0, 113, 227, 0.08)' }} />
        
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={() => handleNavigation('/profile')}
            sx={{ 
              borderRadius: '10px',
              mx: 1,
              py: 1.25,
              transition: 'all 0.15s ease',
              '&:hover': { 
                backgroundColor: mode === 'dark' ? 'rgba(41, 151, 255, 0.12)' : 'rgba(0, 113, 227, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" sx={{ color: mode === 'dark' ? '#8B949E' : '#6E6E73' }} />
            </ListItemIcon>
            <Typography sx={{ color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F', fontWeight: 500 }}>
              Profile
            </Typography>
          </MenuItem>
          
          <MenuItem 
            onClick={() => handleNavigation('/settings')}
            sx={{ 
              borderRadius: '10px',
              mx: 1,
              py: 1.25,
              transition: 'all 0.15s ease',
              '&:hover': { 
                backgroundColor: mode === 'dark' ? 'rgba(41, 151, 255, 0.12)' : 'rgba(0, 113, 227, 0.08)',
              }
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" sx={{ color: mode === 'dark' ? '#8B949E' : '#6E6E73' }} />
            </ListItemIcon>
            <Typography sx={{ color: mode === 'dark' ? '#F0F6FC' : '#1D1D1F', fontWeight: 500 }}>
              Settings
            </Typography>
          </MenuItem>
        </Box>

        <Divider sx={{ borderColor: mode === 'dark' ? 'rgba(48, 54, 61, 0.8)' : 'rgba(0, 113, 227, 0.08)' }} />
        
        <Box sx={{ py: 1 }}>
          <MenuItem 
            onClick={handleLogout}
            sx={{ 
              borderRadius: '10px',
              mx: 1,
              py: 1.25,
              color: '#FF453A',
              transition: 'all 0.15s ease',
              '&:hover': { 
                backgroundColor: 'rgba(255, 69, 58, 0.12)',
              }
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: '#FF453A' }} />
            </ListItemIcon>
            <Typography fontWeight={500}>Logout</Typography>
          </MenuItem>
        </Box>
      </Menu>
    </>
  )
}

export default Header
