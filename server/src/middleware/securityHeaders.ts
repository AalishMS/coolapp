import { Request, Response, NextFunction } from 'express'

interface SecurityHeadersConfig {
  frameguard?: boolean
  xssProtection?: boolean
  contentTypeOptions?: boolean
  referrerPolicy?: boolean
  permissionsPolicy?: boolean
  crossOriginEmbedderPolicy?: boolean
}

const defaults: SecurityHeadersConfig = {
  frameguard: true,
  xssProtection: true,
  contentTypeOptions: true,
  referrerPolicy: true,
  permissionsPolicy: true,
  crossOriginEmbedderPolicy: false,
}

export const securityHeaders = (config: SecurityHeadersConfig = {}) => {
  const options = { ...defaults, ...config }

  return (req: Request, res: Response, next: NextFunction): void => {
    if (options.frameguard) {
      res.setHeader('X-Frame-Options', 'DENY')
    }

    if (options.xssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block')
    }

    if (options.contentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff')
    }

    if (options.referrerPolicy) {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    }

    if (options.permissionsPolicy) {
      res.setHeader(
        'Permissions-Policy',
        [
          'accelerometer=()',
          'camera=()',
          'geolocation=()',
          'gyroscope=()',
          'magnetometer=()',
          'microphone=()',
          'payment=()',
          'usb=()',
        ].join(', ')
      )
    }

    if (options.crossOriginEmbedderPolicy) {
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
    }

    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin')

    next()
  }
}

export const hidePoweredBy = (req: Request, res: Response, next: NextFunction): void => {
  res.removeHeader('X-Powered-By')
  next()
}

export const noCacheHeaders = (req: Request, res: Response, next: NextFunction): void => {
  if (req.path.includes('/auth/logout')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    res.setHeader('Surrogate-Control', 'no-store')
  }
  next()
}
