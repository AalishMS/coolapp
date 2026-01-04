import { describe, it, expect } from 'vitest'
import { render, screen } from '../test/test-utils'
import CustomButton from '../components/ui/Button/Button'

describe('CustomButton Component', () => {
  it('renders with default props', () => {
    render(<CustomButton>Test Button</CustomButton>)
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  it('applies variant styles', () => {
    render(<CustomButton variant="contained">Contained Button</CustomButton>)
    const button = screen.getByText('Contained Button')
    expect(button).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<CustomButton loading>Loading Button</CustomButton>)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('is disabled when loading', () => {
    render(<CustomButton loading>Loading Button</CustomButton>)
    const button = screen.getByText('Loading...')
    expect(button).toBeDisabled()
  })
})