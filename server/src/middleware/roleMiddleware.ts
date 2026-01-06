import { Response, NextFunction } from 'express'
import { AuthRequest } from '../controllers/authController.js'
import { UserRole } from '../models/User.js'

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      })
      return
    }

    next()
  }
}

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin access required',
    })
    return
  }

  next()
}

export const isAdminOrManager = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    })
    return
  }

  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    res.status(403).json({
      success: false,
      message: 'Admin or manager access required',
    })
    return
  }

  next()
}
