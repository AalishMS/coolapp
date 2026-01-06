import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import User, { IUser } from '../models/User'
import { generateToken, generateRefreshToken } from '../utils/jwt.js'
import { blacklistToken } from '../models/BlacklistedToken.js'
import { setCsrfCookies, clearCsrfCookies, createCsrfTokenPair } from '../middleware/csrfMiddleware.js'
import { checkLockout, recordFailedAttempt, recordSuccessfulAttempt } from '../models/LoginAttempt.js'

export interface AuthRequest extends Request {
  user?: IUser
}

const setTokenCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  const isProd = process.env.NODE_ENV === 'production'

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 60 * 60 * 1000, // 1 hour
    path: '/',
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  })
}

const clearTokenCookies = (res: Response): void => {
  const isProd = process.env.NODE_ENV === 'production'

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  })

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  })
}

const sendAuthResponse = (
  res: Response,
  user: IUser,
  accessToken: string,
  refreshToken: string
): void => {
  setTokenCookies(res, accessToken, refreshToken)

  const { token, tokenHash } = createCsrfTokenPair()
  setCsrfCookies(res, token, tokenHash)

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken,
      csrfToken: token,
    },
  })
}

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
      })
      return
    }

    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already registered',
      })
      return
    }

    const user = await User.create({
      name,
      email,
      password,
    })

    const token = generateToken({ id: user._id.toString(), email: user.email })
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    sendAuthResponse(res, user, token, refreshToken)
  } catch (error) {
    next(error)
  }
}

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check database connection first
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.',
      })
      return
    }

    const { email, password } = req.body
    const ip = req.ip || req.connection.remoteAddress || 'unknown'

    const lockoutCheck = await checkLockout(email, ip)
    if (lockoutCheck.locked) {
      res.status(429).json({
        success: false,
        message: lockoutCheck.message,
      })
      return
    }

    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      await recordFailedAttempt(email, ip)
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      await recordFailedAttempt(email, ip)
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    await recordSuccessfulAttempt(email, ip)

    const token = generateToken({ id: user._id.toString(), email: user.email })
    const refreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    sendAuthResponse(res, user, token, refreshToken)
  } catch (error) {
    next(error)
  }
}

export const logout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if (accessToken) {
      await blacklistToken(accessToken, '1h')
    }

    if (refreshToken) {
      await blacklistToken(refreshToken, '7d')
    }

    clearTokenCookies(res)
    clearCsrfCookies(res)

    res.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    next(error)
  }
}

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id)
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) {
      res.status(401).json({
        success: false,
        message: 'Refresh token not found',
      })
      return
    }

    const { verifyRefreshToken } = await import('../utils/jwt.js')
    const decoded = verifyRefreshToken(oldRefreshToken)

    const user = await User.findById(decoded.id)
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    const newAccessToken = generateToken({ id: user._id.toString(), email: user.email })
    const newRefreshToken = generateRefreshToken({
      id: user._id.toString(),
      email: user.email,
    })

    await blacklistToken(oldRefreshToken, '7d')

    sendAuthResponse(res, user, newAccessToken, newRefreshToken)
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    })
  }
}

export const getTokenStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const accessToken = req.cookies.accessToken
  const refreshToken = req.cookies.refreshToken

  res.json({
    success: true,
    data: {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isAuthenticated: !!req.user,
    },
  })
}
