import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from './test-utils'
import Register from '../pages/Register'
import * as AuthContext from '../context/AuthContext'

describe('Register Page', () => {
  const mockRegister = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      register: mockRegister,
      error: null,
      clearError: vi.fn(),
      user: null,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
      deleteAccount: vi.fn(),
    } as unknown as ReturnType<typeof AuthContext.useAuth>)
  })

  it('has register form elements', () => {
    const { container } = render(<Register />)

    expect(container.querySelector('input[name="name"]')).toBeInTheDocument()
    expect(container.querySelector('input[name="email"]')).toBeInTheDocument()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    expect(container.querySelector('button[type="submit"]')).toBeInTheDocument()
  })

  it('displays link to login page', () => {
    render(<Register />)

    const link = screen.getByRole('link', { name: /sign in/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })

  it('calls register function on valid submission', async () => {
    mockRegister.mockResolvedValue(undefined)

    render(<Register />)

    const nameInput = screen.getByRole('textbox', { name: /full name/i }) || screen.getByLabelText(/full name/i)
    const emailInput = screen.getByRole('textbox', { name: /email/i }) || screen.getByLabelText(/email/i)
    const passwordInputs = screen.getAllByLabelText(/password/i)

    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123' } })
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123' } })

    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
      })
    })
  })
})
