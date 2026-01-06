import { Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import User, { IUser } from '../models/User'
import { AuthRequest } from '../controllers/authController.js'
import { isTokenBlacklisted } from '../models/BlacklistedToken.js'

interface TokenPayload {
  id: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser
    }
  }
}

const extractToken = (req: AuthRequest): string | undefined => {
  let token: string | undefined

  if (req.cookies.accessToken) {
    token = req.cookies.accessToken
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  return token
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req)

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      })
      return
    }

    try {
      const isBlacklisted = await isTokenBlacklisted(token)
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          message: 'Token has been invalidated. Please log in again.',
        })
        return
      }

      const secret = process.env.JWT_SECRET
      if (!secret) {
        throw new Error('JWT_SECRET is not defined')
      }

      const decoded = jwt.verify(token, secret) as TokenPayload
      const user = await User.findById(decoded.id)

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found',
        })
        return
      }

      req.user = user
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token is invalid or expired',
      })
    }
  } catch (error) {
    next(error)
  }
}

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req)

    if (token) {
      try {
        const isBlacklisted = await isTokenBlacklisted(token)
        if (isBlacklisted) {
          return next()
        }

        const secret = process.env.JWT_SECRET
        if (secret) {
          const decoded = jwt.verify(token, secret) as TokenPayload
          const user = await User.findById(decoded.id)
          if (user) {
            req.user = user
          }
        }
      } catch {
        // Token invalid, continue without user
      }
    }

    next()
  } catch (error) {
    next(error)
  }
}
