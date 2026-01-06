import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import mongoose from 'mongoose'
import './setup.js'

let mongooseConnection: typeof mongoose
let mongoConnected = false

beforeAll(async () => {
  mongooseConnection = await import('mongoose')
  
  // Try to connect to MongoDB, but don't fail if it's not available
  try {
    if (process.env.MONGODB_URI) {
      await mongooseConnection.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000, // 5 second timeout
      })
      mongoConnected = true
    }
  } catch (error) {
    console.warn('MongoDB not available, skipping database tests')
    mongoConnected = false
  }
}, 10000)

afterAll(async () => {
  if (mongoConnected && mongooseConnection.connection.readyState === 1) {
    await mongooseConnection.disconnect()
  }
})

describe('Database Connection', () => {
  it.skipIf(!mongoConnected)('should connect to MongoDB', () => {
    expect(mongooseConnection.connection.readyState).toBe(1)
  })

  it.skipIf(!mongoConnected)('should use test database', () => {
    expect(process.env.MONGODB_URI).toContain('test_')
  })
})

describe('User Model', () => {
  it('should create a user with role field', async () => {
    const User = (await import('../models/User.js')).default

    const user = new User({
      name: 'Test User',
      email: 'testuser@test.com',
      password: 'TestPass123',
      role: 'user',
    })

    expect(user.role).toBe('user')
  })

  it('should allow admin role', async () => {
    const User = (await import('../models/User.js')).default

    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPass123',
      role: 'admin',
    })

    expect(admin.role).toBe('admin')
  })

  it('should default to user role', async () => {
    const User = (await import('../models/User.js')).default

    const defaultUser = new User({
      name: 'Default User',
      email: 'default@test.com',
      password: 'DefaultPass123',
    })

    expect(defaultUser.role).toBe('user')
  })
})

describe('JWT Utilities', () => {
  it('should generate and verify access token', async () => {
    const { generateToken, verifyToken } = await import('../utils/jwt.js')

    const payload = { id: '123', email: 'test@example.com' }
    const token = generateToken(payload)

    expect(token).toBeDefined()

    const decoded = verifyToken(token)
    expect(decoded.id).toBe('123')
    expect(decoded.email).toBe('test@example.com')
  })

  it('should generate and verify refresh token', async () => {
    const { generateRefreshToken, verifyRefreshToken } = await import('../utils/jwt.js')

    const payload = { id: '123', email: 'test@example.com' }
    const token = generateRefreshToken(payload)

    expect(token).toBeDefined()

    const decoded = verifyRefreshToken(token)
    expect(decoded.id).toBe('123')
    expect(decoded.email).toBe('test@example.com')
  })
})

describe('CSRF Utilities', () => {
  it('should generate CSRF token pair', async () => {
    const { createCsrfTokenPair } = await import('../middleware/csrfMiddleware.js')

    const { token, tokenHash } = createCsrfTokenPair()

    expect(token).toBeDefined()
    expect(tokenHash).toBeDefined()
    expect(token).not.toBe(tokenHash)
    expect(token.length).toBe(64)
  })

  it('should verify valid CSRF token', async () => {
    const { createCsrfTokenPair, verifyCsrfToken } = await import('../middleware/csrfMiddleware.js')

    const { token, tokenHash } = createCsrfTokenPair()
    const isValid = verifyCsrfToken(token, tokenHash)

    expect(isValid).toBe(true)
  })

  it('should reject invalid CSRF token', async () => {
    const { verifyCsrfToken } = await import('../middleware/csrfMiddleware.js')

    const isValid = verifyCsrfToken('invalid-token', 'some-hash')

    expect(isValid).toBe(false)
  })
})

describe('Password Validation', () => {
  it('should validate strong passwords', async () => {
    const { validatePassword } = await import('../utils/validation.js')

    const result = validatePassword('StrongPass123')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject weak passwords', async () => {
    const { validatePassword } = await import('../utils/validation.js')

    const result = validatePassword('weak')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('should require uppercase letter', async () => {
    const { validatePassword } = await import('../utils/validation.js')

    const result = validatePassword('lowercase123')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('uppercase'))).toBe(true)
  })

  it('should require lowercase letter', async () => {
    const { validatePassword } = await import('../utils/validation.js')

    const result = validatePassword('UPPERCASE123')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('lowercase'))).toBe(true)
  })

  it('should require number', async () => {
    const { validatePassword } = await import('../utils/validation.js')

    const result = validatePassword('NoNumbersHere')
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e: string) => e.includes('number'))).toBe(true)
  })
})

describe('Rate Limiting', () => {
  it('should create rate limiter middleware', async () => {
    const { createRateLimiter } = await import('../middleware/rateLimit.js')

    const limiter = createRateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many attempts',
    })

    expect(limiter).toBeDefined()
  })
})
