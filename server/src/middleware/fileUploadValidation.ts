import { Request, Response, NextFunction } from 'express'
import path from 'path'
import crypto from 'crypto'

interface FileValidationConfig {
  allowedMimeTypes: string[]
  maxFileSize: number
  maxFiles: number
}

const defaultConfig: FileValidationConfig = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  maxFileSize: 5 * 1024 * 1024,
  maxFiles: 10,
}

export const validateFileUpload = (config: Partial<FileValidationConfig> = {}) => {
  const options = { ...defaultConfig, ...config }

  return (req: Request, res: Response, next: NextFunction): void => {
    const files = (req as any).files

    if (!files || (Array.isArray(files) && files.length === 0)) {
      next()
      return
    }

    const fileList = Array.isArray(files) ? files : [files]

    if (fileList.length > options.maxFiles) {
      res.status(400).json({
        success: false,
        message: `Maximum ${options.maxFiles} files allowed`,
      })
      return
    }

    for (const file of fileList) {
      const mimeType = file.mimetype || (file.type as string)

      if (!options.allowedMimeTypes.includes(mimeType)) {
        res.status(400).json({
          success: false,
          message: `File type not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
        })
        return
      }

      if (file.size > options.maxFileSize) {
        res.status(400).json({
          success: false,
          message: `File too large. Maximum size: ${options.maxFileSize / 1024 / 1024}MB`,
        })
        return
      }
    }

    next()
  }
}

export const sanitizeFilename = (filename: string): string => {
  const ext = path.extname(filename)
  const name = path.basename(filename, ext)
  const sanitized = name.replace(/[^a-zA-Z0-9-_]/g, '_')
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex')
  return `${sanitized}_${timestamp}_${random}${ext}`
}

export const generateSecureFilename = (originalName: string): string => {
  return sanitizeFilename(originalName)
}

export const isSafeFilename = (filename: string): boolean => {
  const dangerousPatterns = [
    /\.\./,
    /\0/,
    /\/etc\/passwd/,
    /\/etc\/shadow/,
    /\/proc\/self/,
    /^\./,
    /[\x00-\x1f\x7f]/,
  ]

  return !dangerousPatterns.some(pattern => pattern.test(filename))
}

export const validateImageUpload = (req: Request, res: Response, next: NextFunction): void => {
  const imageConfig: Partial<FileValidationConfig> = {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFileSize: 2 * 1024 * 1024,
    maxFiles: 5,
  }

  validateFileUpload(imageConfig)(req, res, next)
}

export const validateDocumentUpload = (req: Request, res: Response, next: NextFunction): void => {
  const documentConfig: Partial<FileValidationConfig> = {
    allowedMimeTypes: [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 3,
  }

  validateFileUpload(documentConfig)(req, res, next)
}
