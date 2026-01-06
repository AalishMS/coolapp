import { Request, Response, NextFunction } from 'express'
import validator from 'validator'

interface SanitizationOptions {
  trim?: boolean
  escape?: boolean
  normalizeEmail?: boolean
  toLowerCase?: boolean
  toUpperCase?: boolean
  stripHtml?: boolean
}

const defaultOptions: SanitizationOptions = {
  trim: true,
  escape: true,
  normalizeEmail: true,
  stripHtml: true,
}

const sanitizeString = (value: unknown, options: SanitizationOptions = {}): string => {
  if (typeof value !== 'string') {
    return ''
  }

  let result = value

  if (options.stripHtml) {
    result = validator.stripLow(result as string)
    if (options.trim) {
      result = validator.trim(result as string)
    }
  } else if (options.trim) {
    result = validator.trim(result as string)
  }

  if (options.escape) {
    result = validator.escape(result as string)
  }

  if (options.toLowerCase) {
    result = (result as string).toLowerCase()
  }

  if (options.toUpperCase) {
    result = (result as string).toUpperCase()
  }

  return result as string
}

const sanitizeObject = (
  obj: Record<string, unknown>,
  options: SanitizationOptions = {}
): Record<string, unknown> => {
  const sanitized: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options)
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

export const sanitizeBody = (options: SanitizationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sanitizationOptions = { ...defaultOptions, ...options }

    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body, sanitizationOptions) as Record<string, unknown>
    }

    next()
  }
}

export const sanitizeQuery = (options: SanitizationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sanitizationOptions = { ...defaultOptions, ...options }

    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          sanitizedQuery[key] = sanitizeString(value, sanitizationOptions)
        } else {
          sanitizedQuery[key] = value
        }
      }
      req.query = sanitizedQuery as Record<string, string>
    }

    next()
  }
}

export const sanitizeParams = (options: SanitizationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sanitizationOptions = { ...defaultOptions, ...options }

    if (req.params && typeof req.params === 'object') {
      const sanitizedParams: Record<string, string> = {}
      for (const [key, value] of Object.entries(req.params)) {
        sanitizedParams[key] = sanitizeString(value, sanitizationOptions)
      }
      req.params = sanitizedParams
    }

    next()
  }
}

export const sanitizeRequest = (options: SanitizationOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    sanitizeBody(options)(req, res, () => {
      sanitizeQuery(options)(req, res, () => {
        sanitizeParams(options)(req, res, next)
      })
    })
  }
}

export const isValidEmail = (email: string): boolean => {
  return validator.isEmail(email)
}

export const isValidUUID = (id: string): boolean => {
  return validator.isUUID(id)
}

export const isStrongPassword = (password: string): boolean => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
}

export const sanitizeForHTML = (input: string): string => {
  return validator.escape(input.trim())
}

export const sanitizeForSQL = (input: string): string => {
  return input.replace(/['";\\]/g, '')
}

export const limitStringLength = (input: string, maxLength: number): string => {
  return validator.trim(input).slice(0, maxLength)
}
