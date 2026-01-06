import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from './test-utils'
import Profile from '../pages/Profile'
import * as AuthContext from '../context/AuthContext'

describe('Profile Page', () => {
  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      deleteAccount: vi.fn(),
      error: null,
      clearError: vi.fn(),
      loading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    } as unknown as ReturnType<typeof AuthContext.useAuth>)
  })

  it('has profile page elements', () => {
    const { container } = render(<Profile />)

    expect(container.querySelector('input[name="currentPassword"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="newPassword"]')).toBeInTheDocument()
  })

  it('displays user initials in avatar', () => {
    render(<Profile />)

    expect(screen.getByText('TU')).toBeInTheDocument()
  })
})
