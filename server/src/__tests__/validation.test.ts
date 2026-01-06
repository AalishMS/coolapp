import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } from '../utils/validation.js'
import { validationResult } from 'express-validator'

const mockRequest = (body: any) => ({
  body,
})

const runValidation = async (validations: any[], req: any) => {
  for (const validation of validations) {
    await validation.run(req)
  }
  return validationResult(req)
}

describe('Validation Utils', () => {
  describe('registerValidation', () => {
    it('should pass valid registration data', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      })
      
      const result = await runValidation(registerValidation, req)
      expect(result.isEmpty()).toBe(true)
    })

    it('should fail if name is empty', async () => {
      const req = mockRequest({
        name: '',
        email: 'john@example.com',
        password: 'Password123',
      })
      
      const result = await runValidation(registerValidation, req)
      expect(result.isEmpty()).toBe(false)
    })

    it('should fail if email is invalid', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'Password123',
      })
      
      const result = await runValidation(registerValidation, req)
      expect(result.isEmpty()).toBe(false)
    })

    it('should fail if password is too short', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      })
      
      const result = await runValidation(registerValidation, req)
      expect(result.isEmpty()).toBe(false)
    })

    it('should fail if password lacks uppercase', async () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      })
      
      const result = await runValidation(registerValidation, req)
      expect(result.isEmpty()).toBe(false)
    })
  })

  describe('loginValidation', () => {
    it('should pass valid login data', async () => {
      const req = mockRequest({
        email: 'john@example.com',
        password: 'Password123',
      })
      
      const result = await runValidation(loginValidation, req)
      expect(result.isEmpty()).toBe(true)
    })

    it('should fail if email is empty', async () => {
      const req = mockRequest({
        email: '',
        password: 'Password123',
      })
      
      const result = await runValidation(loginValidation, req)
      expect(result.isEmpty()).toBe(false)
    })

    it('should fail if password is empty', async () => {
      const req = mockRequest({
        email: 'john@example.com',
        password: '',
      })
      
      const result = await runValidation(loginValidation, req)
      expect(result.isEmpty()).toBe(false)
    })
  })

  describe('changePasswordValidation', () => {
    it('should pass valid password change data', async () => {
      const req = mockRequest({
        currentPassword: 'OldPassword123',
        newPassword: 'NewPassword456',
      })
      
      const result = await runValidation(changePasswordValidation, req)
      expect(result.isEmpty()).toBe(true)
    })

    it('should fail if new password is same as current', async () => {
      const req = mockRequest({
        currentPassword: 'Password123',
        newPassword: 'Password123',
      })
      
      const result = await runValidation(changePasswordValidation, req)
      expect(result.isEmpty()).toBe(false)
    })
  })
})
