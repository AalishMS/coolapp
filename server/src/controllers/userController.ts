import { Request, Response, NextFunction } from 'express'
import User, { IUser } from '../models/User'
import { generateToken } from '../utils/jwt.js'

interface AuthRequest extends Request {
  user?: IUser
}

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id).select('-password')
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email } = req.body

    const user = await User.findById(req.user?._id)
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    if (name) {
      if (name.length < 2 || name.length > 50) {
        res.status(400).json({
          success: false,
          message: 'Name must be between 2 and 50 characters',
        })
        return
      }
      user.name = name
    }

    if (email && email !== user.email) {
      const emailRegex = /^\S+@\S+\.\S+$/
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Please enter a valid email address',
        })
        return
      }

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Email already in use',
        })
        return
      }
      user.email = email
    }

    await user.save()

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password || password.length === 0) {
    return { valid: false, message: 'Password is required' }
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }

  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }

  return { valid: true, message: '' }
}

export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword) {
      res.status(400).json({
        success: false,
        message: 'Current password is required',
      })
      return
    }

    if (!newPassword) {
      res.status(400).json({
        success: false,
        message: 'New password is required',
      })
      return
    }

    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        message: passwordValidation.message,
      })
      return
    }

    const user = await User.findById(req.user?._id).select('+password')
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

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        message: 'New password must be different from current password',
      })
      return
    }

    user.password = newPassword
    await user.save()

    const token = generateToken({ id: user._id.toString(), email: user.email })

    res.json({
      success: true,
      message: 'Password changed successfully',
      data: { token },
    })
  } catch (error) {
    next(error)
  }
}

export const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { confirmEmail } = req.body

    const user = await User.findById(req.user?._id)
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    if (confirmEmail !== user.email) {
      res.status(400).json({
        success: false,
        message: 'Email confirmation does not match',
      })
      return
    }

    await User.findByIdAndDelete(user._id)

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    res.json({
      success: true,
      message: 'Account deleted successfully',
    })
  } catch (error) {
    next(error)
  }
}
