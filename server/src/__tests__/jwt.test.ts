import { describe, it, expect, beforeAll } from 'vitest'

process.env.JWT_SECRET = 'test_jwt_secret_key_for_unit_tests_only_32chars'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_key_for_unit_tests_only_32chars'

import { generateToken, generateRefreshToken, verifyToken, verifyRefreshToken, validateJwtConfig } from '../utils/jwt.js'

describe('JWT Utilities', () => {
  describe('Configuration Validation', () => {
    it('should validate JWT configuration successfully', () => {
      const result = validateJwtConfig()
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include correct payload in token', () => {
      const payload = { id: 'user-123', email: 'admin@test.com' }
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })
  })

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateRefreshToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3)
    })

    it('should include correct payload in refresh token', () => {
      const payload = { id: 'user-456', email: 'user@test.com' }
      const token = generateRefreshToken(payload)
      const decoded = verifyRefreshToken(token)
      
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })
  })

  describe('verifyToken', () => {
    it('should verify a valid token and return payload', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })

    it('should throw error for invalid token', () => {
      expect(() => verifyToken('invalid-token')).toThrow()
    })

    it('should throw error for tampered token', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateToken(payload)
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      
      expect(() => verifyToken(tamperedToken)).toThrow()
    })
  })

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateRefreshToken(payload)
      const decoded = verifyRefreshToken(token)
      
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
    })

    it('should throw error for invalid refresh token', () => {
      expect(() => verifyRefreshToken('invalid-refresh-token')).toThrow()
    })
  })

  describe('Token Validity', () => {
    it('should generate tokens with correct expiration', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      
      // Token should be valid and contain the payload
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
      
      // Decoded token should have exp and iat claims
      expect((decoded as any).exp).toBeDefined()
      expect((decoded as any).iat).toBeDefined()
    })

    it('should generate refresh tokens with correct expiration', () => {
      const payload = { id: 'test-id', email: 'test@example.com' }
      const token = generateRefreshToken(payload)
      const decoded = verifyRefreshToken(token)
      
      // Token should be valid and contain the payload
      expect(decoded.id).toBe(payload.id)
      expect(decoded.email).toBe(payload.email)
      
      // Decoded token should have exp and iat claims
      expect((decoded as any).exp).toBeDefined()
      expect((decoded as any).iat).toBeDefined()
    })
  })
})
