import { Router } from 'express'
import { register, login, logout, me, refreshToken, getTokenStatus } from '../controllers/authController.js'
import { protect, optionalAuth } from '../middleware/authMiddleware.js'
import { registerValidation, loginValidation, validate } from '../utils/validation.js'
import { authLimiter, refreshTokenLimiter } from '../middleware/rateLimit.js'
import { validateCsrf } from '../middleware/csrfMiddleware.js'

const router = Router()

router.post('/register', authLimiter, registerValidation, validate, register)
router.post('/login', authLimiter, loginValidation, validate, login)
router.post('/logout', protect, validateCsrf, logout)
router.get('/me', protect, me)
router.post('/refresh', refreshTokenLimiter, validateCsrf, refreshToken)
router.get('/status', optionalAuth, getTokenStatus)

export default router
