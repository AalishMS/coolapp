import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider, Theme } from '@mui/material/styles'

interface ThemeContextType {
  mode: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: mode === 'light' ? '#0071E3' : '#2997FF',
      light: mode === 'light' ? '#5AC8FA' : '#64D2FF',
      dark: mode === 'light' ? '#0058B9' : '#0A84FF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: mode === 'light' ? '#5E5CE6' : '#BF5AF2',
      light: mode === 'light' ? '#A8A6FF' : '#D48AFF',
      dark: mode === 'light' ? '#4240B3' : '#9A33D6',
      contrastText: '#FFFFFF',
    },
    success: {
      main: mode === 'light' ? '#30D158' : '#32D74B',
      light: mode === 'light' ? '#A8F0B8' : '#5AE079',
      dark: mode === 'light' ? '#248A3D' : '#20BD4C',
    },
    warning: {
      main: mode === 'light' ? '#FF9F0A' : '#FFD60A',
      light: mode === 'light' ? '#FFD180' : '#FFE066',
      dark: mode === 'light' ? '#C77700' : '#CC9A00',
    },
    error: {
      main: mode === 'light' ? '#FF3B30' : '#FF453A',
      light: mode === 'light' ? '#FF8A80' : '#FF6961',
      dark: mode === 'light' ? '#D32F2F' : '#D70015',
    },
    background: {
      default: mode === 'light' ? '#F2F5F9' : '#0D1117',
      paper: mode === 'light' ? '#FFFFFF' : '#161B22',
    },
    text: {
      primary: mode === 'light' ? '#1D1D1F' : '#F0F6FC',
      secondary: mode === 'light' ? '#6E6E73' : '#8B949E',
    },
    divider: mode === 'light' ? 'rgba(0, 113, 227, 0.12)' : 'rgba(48, 54, 61, 0.8)',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    body1: {
      fontSize: '0.9375rem',
    },
    body2: {
      fontSize: '0.875rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 22px',
          boxShadow: 'none',
          fontWeight: 600,
          letterSpacing: '0.01em',
          transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            boxShadow: mode === 'light' 
              ? '0 4px 14px rgba(0, 113, 227, 0.25)' 
              : '0 4px 14px rgba(41, 151, 255, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          background: mode === 'light'
            ? 'linear-gradient(135deg, #0071E3 0%, #0058B9 100%)'
            : 'linear-gradient(135deg, #2997FF 0%, #0A84FF 100%)',
          '&:hover': {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #0077ED 0%, #0062CC 100%)'
              : 'linear-gradient(135deg, #40A9FF 0%, #1A8FFF 100%)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
            backgroundColor: mode === 'light' 
              ? 'rgba(0, 113, 227, 0.06)' 
              : 'rgba(41, 151, 255, 0.12)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? '#0071E3' : '#2997FF',
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                boxShadow: mode === 'light'
                  ? '0 0 0 4px rgba(0, 113, 227, 0.12)'
                  : '0 0 0 4px rgba(41, 151, 255, 0.2)',
              },
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: mode === 'light'
            ? '0 2px 12px rgba(0, 113, 227, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)'
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          backgroundImage: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: mode === 'light'
            ? '0 2px 12px rgba(0, 113, 227, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)'
            : '0 4px 20px rgba(0, 0, 0, 0.4)',
          border: mode === 'light' 
            ? '1px solid rgba(0, 113, 227, 0.08)' 
            : '1px solid rgba(48, 54, 61, 0.6)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 8px 30px rgba(0, 113, 227, 0.15), 0 2px 8px rgba(0, 0, 0, 0.06)'
              : '0 12px 40px rgba(0, 0, 0, 0.5)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 28,
          boxShadow: mode === 'light'
            ? '0 24px 80px rgba(0, 113, 227, 0.2), 0 8px 24px rgba(0, 0, 0, 0.1)'
            : '0 24px 80px rgba(0, 0, 0, 0.6)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid',
          borderColor: 'divider',
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 113, 227, 0.04)' 
            : 'rgba(41, 151, 255, 0.08)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: mode === 'light' 
              ? 'rgba(0, 113, 227, 0.04)' 
              : 'rgba(41, 151, 255, 0.06)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          marginLeft: 8,
          marginRight: 8,
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background: mode === 'light'
              ? 'linear-gradient(135deg, #0071E3 0%, #0058B9 100%)'
              : 'linear-gradient(135deg, #2997FF 0%, #0A84FF 100%)',
            color: '#FFFFFF',
            boxShadow: mode === 'light'
              ? '0 4px 12px rgba(0, 113, 227, 0.3)'
              : '0 4px 12px rgba(41, 151, 255, 0.35)',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #0077ED 0%, #0062CC 100%)'
                : 'linear-gradient(135deg, #40A9FF 0%, #1A8FFF 100%)',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' 
              ? 'rgba(0, 113, 227, 0.08)' 
              : 'rgba(41, 151, 255, 0.12)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 10,
          backgroundColor: mode === 'light' ? '#1D1D1F' : '#F0F6FC',
          color: mode === 'light' ? '#FFFFFF' : '#1D1D1F',
          fontSize: '0.8125rem',
          padding: '8px 14px',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light'
            ? '0 4px 14px rgba(0, 113, 227, 0.3)'
            : '0 4px 14px rgba(41, 151, 255, 0.35)',
        },
      },
    },
  },
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme-mode')
      if (saved) return saved as 'light' | 'dark'
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark'
      }
    }
    return 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem('theme-mode')
      if (!saved) {
        setMode(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const theme = createTheme(getDesignTokens(mode))

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider')
  }
  return context
}
