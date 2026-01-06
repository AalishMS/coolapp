import { useState } from 'react'
import { ReactNode } from 'react'
import { Box, Toolbar, Container, useTheme } from '@mui/material'
import Header from './Header'
import Sidebar from './Sidebar'
import { useThemeContext } from '../../context/ThemeContext'

interface MainLayoutProps {
  children: ReactNode
}

const drawerWidth = 280

const MainLayout = ({ children }: MainLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const { mode } = useThemeContext()

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        width: '100%', 
        minHeight: '100vh',
        background: mode === 'dark'
          ? 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)'
          : 'linear-gradient(180deg, #F2F5F9 0%, #E8EDF4 100%)',
      }}
    >
      <Header onMenuClick={handleDrawerToggle} />
      <Sidebar open={mobileOpen} onClose={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        <Toolbar />
        <Container 
          maxWidth="xl" 
          sx={{ 
            mt: 2,
            animation: 'fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            '@keyframes fadeIn': {
              from: {
                opacity: 0,
                transform: 'translateY(8px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
}

export default MainLayout
