import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { forgotPassword, resetPassword, changePassword } from '../controllers/passwordController.js'
import { body, validationResult } from 'express-validator'

const router = Router()

const emailValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
]

const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('token')
    .trim()
    .notEmpty()
    .withMessage('Token is required'),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
]

const changePasswordValidation = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
]

const validate = (req: any, res: any, next: any): void => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map((err: any) => ({
        field: err.path,
        message: err.msg,
      })),
    })
    return
  }
  next()
}

router.post('/forgot-password', emailValidation, validate, forgotPassword)
router.post('/reset-password', resetPasswordValidation, validate, resetPassword)
router.put('/change-password', protect, changePasswordValidation, validate, changePassword)

export default router
