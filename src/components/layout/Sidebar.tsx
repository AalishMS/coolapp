import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Toolbar,
  useTheme,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  LocalShipping as StockIcon,
  Assessment as ReportsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useThemeContext } from '../../context/ThemeContext'

const drawerWidth = 280

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Stock', icon: <StockIcon />, path: '/stock' },
  { text: 'Reports', icon: <ReportsIcon />, path: '/reports' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const { mode } = useThemeContext()

  const handleNavigation = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
          backgroundColor: mode === 'dark' 
            ? 'rgba(13, 17, 23, 0.95)' 
            : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: mode === 'dark'
            ? '1px solid rgba(48, 54, 61, 0.8)'
            : '1px solid rgba(0, 113, 227, 0.1)',
        },
      }}
    >
      {/* Spacer for AppBar */}
      <Toolbar />
      
      {/* Logo Section */}
      <Box 
        sx={{ 
          p: 3.5,
          pb: 3,
          borderBottom: mode === 'dark'
            ? '1px solid rgba(48, 54, 61, 0.6)'
            : '1px solid rgba(0, 113, 227, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: mode === 'dark'
                ? 'linear-gradient(135deg, #2997FF 0%, #64D2FF 100%)'
                : 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: mode === 'dark'
                ? '0 6px 20px rgba(41, 151, 255, 0.35)'
                : '0 6px 20px rgba(0, 113, 227, 0.3)',
            }}
          >
            <Typography 
              sx={{ 
                color: '#fff', 
                fontWeight: 700, 
                fontSize: '18px',
                letterSpacing: '-0.02em',
              }}
            >
              IM
            </Typography>
          </Box>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, #2997FF 0%, #64D2FF 100%)'
                  : 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              Inventory
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: mode === 'dark' ? '#8B949E' : '#6E6E73',
                display: 'block',
                fontSize: '0.75rem',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Management System
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Section */}
      <Box sx={{ py: 2, px: 1.5 }}>
        <Typography
          sx={{
            px: 2,
            mb: 1.5,
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: mode === 'dark' ? '#484F58' : '#AEAEB2',
          }}
        >
          Navigation
        </Typography>
        
        <List sx={{ px: 0 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path
            
            return (
              <ListItemButton
                key={item.text}
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: '14px',
                  mb: 0.75,
                  mx: 0.5,
                  py: 1.5,
                  px: 2,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&.Mui-selected': {
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, #2997FF 0%, #0A84FF 100%)'
                      : 'linear-gradient(135deg, #0071E3 0%, #0058B9 100%)',
                    color: '#FFFFFF',
                    boxShadow: mode === 'dark'
                      ? '0 6px 20px rgba(41, 151, 255, 0.4)'
                      : '0 6px 20px rgba(0, 113, 227, 0.35)',
                    '&:hover': {
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #40A9FF 0%, #2997FF 100%)'
                        : 'linear-gradient(135deg, #0077ED 0%, #0062CC 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: '#FFFFFF',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                      pointerEvents: 'none',
                    },
                  },
                  '&:not(.Mui-selected):hover': {
                    backgroundColor: mode === 'dark' 
                      ? 'rgba(41, 151, 255, 0.12)' 
                      : 'rgba(0, 113, 227, 0.08)',
                    '& .MuiListItemIcon-root': {
                      color: mode === 'dark' ? '#2997FF' : '#0071E3',
                    },
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 44,
                    color: isSelected 
                      ? '#FFFFFF' 
                      : mode === 'dark' ? '#8B949E' : '#6E6E73',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.9375rem',
                    letterSpacing: '-0.01em',
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box 
        sx={{ 
          mt: 'auto', 
          p: 3,
          borderTop: mode === 'dark'
            ? '1px solid rgba(48, 54, 61, 0.6)'
            : '1px solid rgba(0, 113, 227, 0.08)',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: '14px',
            background: mode === 'dark'
              ? 'rgba(41, 151, 255, 0.08)'
              : 'rgba(0, 113, 227, 0.04)',
            border: mode === 'dark'
              ? '1px solid rgba(41, 151, 255, 0.15)'
              : '1px solid rgba(0, 113, 227, 0.1)',
          }}
        >
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: mode === 'dark' ? '#2997FF' : '#0071E3',
              mb: 0.5,
            }}
          >
            Tahoe Design
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              color: mode === 'dark' ? '#8B949E' : '#6E6E73',
            }}
          >
            Modern inventory management
          </Typography>
        </Box>
      </Box>
    </Drawer>
  )
}

export default Sidebar
