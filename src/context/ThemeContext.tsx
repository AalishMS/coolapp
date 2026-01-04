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
    ...(mode === 'light'
      ? {
          primary: { main: '#1976D2' },
          secondary: { main: '#DC004E' },
          success: { main: '#2E7D32' },
          warning: { main: '#ED6C02' },
          error: { main: '#D32F2F' },
          background: { default: '#F5F5F5', paper: '#FFFFFF' },
          text: { primary: '#1a1a1a', secondary: '#666666' },
        }
      : {
          primary: { main: '#90CAF9' },
          secondary: { main: '#F48FB1' },
          success: { main: '#A5D6A7' },
          warning: { main: '#FFB74D' },
          error: { main: '#EF5350' },
          background: { default: '#121212', paper: '#1E1E1E' },
          text: { primary: '#ffffff', secondary: '#b0b0b0' },
        }),
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode')
    return (saved as 'light' | 'dark') || 'light'
  })

  const theme = createTheme(getDesignTokens(mode))

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
  }, [mode])

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

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
