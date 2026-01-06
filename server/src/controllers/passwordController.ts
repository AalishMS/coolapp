import { Request, Response, NextFunction } from 'express'
import User from '../models/User.js'
import {
  createPasswordResetToken,
  validateResetToken,
  markTokenAsUsed,
} from '../models/PasswordReset.js'
import { validatePassword } from '../utils/validation.js'
import crypto from 'crypto'

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (user) {
      await createPasswordResetToken(email)
    }

    res.json({
      success: true,
      message: 'If an account exists with that email, a password reset link will be sent.',
    })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, token, newPassword } = req.body

    const tokenValidation = await validateResetToken(email, token)
    if (!tokenValidation.valid) {
      res.status(400).json({
        success: false,
        message: tokenValidation.message,
      })
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors,
      })
      return
    }

    const user = await User.findOne({ email })
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    user.password = newPassword
    await user.save()

    await markTokenAsUsed(email, token)

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (
  req: any,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user._id

    const user = await User.findById(userId).select('+password')
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      })
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      res.status(400).json({
        success: false,
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors,
      })
      return
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      })
      return
    }

    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully',
    })
  } catch (error) {
    next(error)
  }
}
