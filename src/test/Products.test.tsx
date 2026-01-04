import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { render } from '../test/test-utils'
import Products from '../pages/Products/index'

describe('Products Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders products page with correct title', () => {
    render(<Products />)
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('shows add product button', () => {
    render(<Products />)
    expect(screen.getByText('Add Product')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Products />)
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })
})
