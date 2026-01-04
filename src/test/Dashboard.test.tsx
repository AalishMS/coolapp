import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { render } from '../test/test-utils'
import Dashboard from '../pages/Dashboard/index'

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('renders KPI cards', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Total Products')).toBeInTheDocument()
      expect(screen.getByText('Low Stock Items')).toBeInTheDocument()
      expect(screen.getByText('Total Value')).toBeInTheDocument()
      expect(screen.getByText('Monthly Growth')).toBeInTheDocument()
    })
  })

  it('renders activity feed', async () => {
    render(<Dashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    })
  })
})