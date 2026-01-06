import { render, RenderOptions, RenderResult } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'
import { User } from '../services/authService'

interface CustomRenderOptions extends RenderOptions {
  authState?: {
    user: User | null
    loading: boolean
    error: string | null
  }
}

const AllTheProviders = ({ children, authState }: { children: React.ReactNode; authState?: CustomRenderOptions['authState'] }) => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
): RenderResult => {
  const { authState, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders authState={authState}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

const renderWithRouter = (
  ui: React.ReactElement,
  { route = '/' } = {}
) => {
  window.history.pushState({}, 'Test Page', route)
  return render(ui, { wrapper: AllTheProviders })
}

const renderWithAuth = (
  ui: React.ReactElement,
  user: User
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        authState={{
          user,
          loading: false,
          error: null,
        }}
      >
        {children}
      </AllTheProviders>
    ),
  })
}

const renderWithoutAuth = (ui: React.ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        authState={{
          user: null,
          loading: false,
          error: null,
        }}
      >
        {children}
      </AllTheProviders>
    ),
  })
}

export * from '@testing-library/react'
export { customRender as render, renderWithRouter, renderWithAuth, renderWithoutAuth }
