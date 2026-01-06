import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show error for empty email', async ({ page }) => {
    await page.locator('input[type="password"]').fill('Password123')
    await page.locator('button[type="submit"]').click()
    const error = page.locator('.error, .Mui-error').first()
    await expect(error).toContainText(/email/i)
  })

  test('should show error for empty password', async ({ page }) => {
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('button[type="submit"]').click()
    const error = page.locator('.error, .Mui-error').first()
    await expect(error).toContainText(/password/i)
  })
})

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display registration form', async ({ page }) => {
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show error for short name', async ({ page }) => {
    await page.locator('input[name="name"]').fill('A')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('Password123')
    await page.locator('button[type="submit"]').click()
    const error = page.locator('.error, .Mui-error').first()
    await expect(error).toContainText(/name/i)
  })

  test('should show error for invalid email', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Test User')
    await page.locator('input[type="email"]').fill('invalid-email')
    await page.locator('input[type="password"]').fill('Password123')
    await page.locator('button[type="submit"]').click()
    const error = page.locator('.error, .Mui-error').first()
    await expect(error).toContainText(/email/i)
  })

  test('should show error for weak password', async ({ page }) => {
    await page.locator('input[name="name"]').fill('Test User')
    await page.locator('input[type="email"]').fill('test@example.com')
    await page.locator('input[type="password"]').fill('weak')
    await page.locator('button[type="submit"]').click()
    const error = page.locator('.error, .Mui-error').first()
    await expect(error).toContainText(/password/i)
  })
})

test.describe('Navigation', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login|\//)
  })

  test('should show 404 for unknown route', async ({ page }) => {
    await page.goto('/unknown-route')
    await expect(page.locator('text=404')).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Accessibility', () => {
  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('aria-label')
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login')
    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="email"]')).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(page.locator('input[type="password"]')).toBeFocused()
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
  })

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/login')
    await expect(page.locator('form')).toBeVisible()
  })
})
