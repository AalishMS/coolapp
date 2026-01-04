import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from './test-utils'
import Dashboard from '../pages/Dashboard'
import Products from '../pages/Products'
import Stock from '../pages/Stock'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import MainLayout from '../components/layout/MainLayout'

describe('DASHBOARD TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('DASHBOARD-001: Dashboard loads without errors', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('DASHBOARD-002: Dashboard title is visible', () => {
    render(<Dashboard />)
    const title = screen.getByRole('heading', { level: 4 })
    expect(title).toHaveTextContent('Dashboard')
  })

  it('DASHBOARD-003: KPI cards render with correct titles', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      expect(screen.getByText('Total Value')).toBeInTheDocument()
      expect(screen.getByText('Monthly Growth')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('DASHBOARD-004: Activity feed section exists', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})

describe('PRODUCTS TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('PRODUCTS-001: Products page loads without errors', () => {
    render(<Products />)
    expect(screen.getByText('Products')).toBeInTheDocument()
  })

  it('PRODUCTS-002: Add Product button exists', () => {
    render(<Products />)
    expect(screen.getByText('Add Product')).toBeInTheDocument()
  })

  it('PRODUCTS-003: Search input field exists', () => {
    render(<Products />)
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument()
  })

  it('PRODUCTS-004: Category filter exists', () => {
    render(<Products />)
    expect(screen.getAllByText('Category').length).toBeGreaterThan(0)
  })

  it('PRODUCTS-005: Product table exists', async () => {
    render(<Products />)
    
    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})

describe('STOCK TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('STOCK-001: Stock page loads without errors', () => {
    render(<Stock />)
    expect(screen.getByText('Stock Management')).toBeInTheDocument()
  })

  it('STOCK-002: Add Transaction button exists', () => {
    render(<Stock />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })

  it('STOCK-003: Stock Status Overview section exists', async () => {
    render(<Stock />)
    
    await waitFor(() => {
      expect(screen.getByText('Stock Status Overview')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('STOCK-004: Recent Transactions section exists', async () => {
    render(<Stock />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
    }, { timeout: 5000 })
  })
})

describe('REPORTS TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('REPORTS-001: Reports page loads without errors', () => {
    render(<Reports />)
    expect(screen.getByText('Reports')).toBeInTheDocument()
  })

  it('REPORTS-002: Report filters section exists', () => {
    render(<Reports />)
    expect(screen.getByText('Report Filters')).toBeInTheDocument()
  })

  it('REPORTS-003: Refresh button exists', () => {
    render(<Reports />)
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })
})

describe('SETTINGS TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('SETTINGS-001: Settings page loads without errors', () => {
    render(<Settings />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('SETTINGS-002: Appearance section exists', () => {
    render(<Settings />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
  })
})

describe('LAYOUT TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('LAYOUT-001: User account icon exists', () => {
    render(<MainLayout><div>Content</div></MainLayout>)
    expect(screen.getByTestId('AccountCircleIcon')).toBeInTheDocument()
  })
})

describe('USER MENU TESTS', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('USER-001: User menu opens when account icon clicked', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'test@example.com', name: 'Test User' }))
    render(<MainLayout><div>Content</div></MainLayout>)
    
    const accountIcon = screen.getByTestId('AccountCircleIcon')
    await userEvent.click(accountIcon)
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('USER-002: User menu has Logout option', async () => {
    render(<MainLayout><div>Content</div></MainLayout>)
    
    await userEvent.click(screen.getByTestId('AccountCircleIcon'))
    
    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })
  })
})
