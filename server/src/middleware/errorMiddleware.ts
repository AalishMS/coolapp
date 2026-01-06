import { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'

interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
  code?: number
  keyValue?: Record<string, string>
  errors?: Record<string, { message: string }>
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err, name: err.name || 'Error', message: err.message }

  console.error('Error:', err)

  // Check for MongoDB connection issues
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database connection unavailable. Please try again later.',
    })
    return
  }

  // MongoDB Connection Error
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    error = {
      message: 'Database connection failed. Please try again later.',
      statusCode: 503,
      name: 'DatabaseConnectionError'
    }
  }

  // MongoDB Timeout Error
  if (err.name === 'MongoTimeoutError') {
    error = {
      message: 'Database operation timed out. Please try again.',
      statusCode: 504,
      name: 'DatabaseTimeoutError'
    }
  }

  if (err.name === 'CastError') {
    error = { message: 'Resource not found', statusCode: 404, name: 'CastError' }
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0]
    error = { 
      message: `Duplicate field value: ${field}. Please use another value.`,
      statusCode: 400,
      name: 'DuplicateError'
    }
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val: any) => val.message)
    error = { 
      message: `Validation Error: ${messages.join('. ')}`,
      statusCode: 400,
      name: 'ValidationError'
    }
  }

  if (err.name === 'JsonWebTokenError') {
    error = { 
      message: 'Invalid token. Please log in again.',
      statusCode: 401,
      name: 'JsonWebTokenError'
    }
  }

  if (err.name === 'TokenExpiredError') {
    error = { 
      message: 'Token expired. Please log in again.',
      statusCode: 401,
      name: 'TokenExpiredError'
    }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
}
