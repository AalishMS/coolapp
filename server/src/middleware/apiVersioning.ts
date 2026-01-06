import { Request, Response, NextFunction } from 'express'

const API_VERSION_HEADER = 'api-version'
const DEFAULT_VERSION = 'v1'

const versionPatterns: Record<string, RegExp> = {
  v1: /^1(\..+)?$/,
  v2: /^2(\..+)?$/,
}

export const apiVersioning = (
  options: {
    header?: string
    defaultVersion?: string
    allowedVersions?: string[]
  } = {}
) => {
  const header = options.header || API_VERSION_HEADER
  const defaultVersion = options.defaultVersion || DEFAULT_VERSION
  const allowedVersions = options.allowedVersions || Object.keys(versionPatterns)

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestedVersion = req.get(header) || defaultVersion

    if (!allowedVersions.includes(requestedVersion)) {
      res.set('Accept-Version', allowedVersions.join(', '))
      res.status(400).json({
        success: false,
        message: `Unsupported API version: ${requestedVersion}`,
        supported_versions: allowedVersions,
      })
      return
    }

    res.set('X-API-Version', requestedVersion)
    ;(req as any).apiVersion = requestedVersion

    next()
  }
}

export const requireVersion = (minimumVersion: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentVersion = (req as any).apiVersion || DEFAULT_VERSION

    const currentMajor = parseInt(currentVersion.replace(/^v(\d+).*$/, '$1'))
    const requiredMajor = parseInt(minimumVersion.replace(/^v(\d+).*$/, '$1'))

    if (currentMajor < requiredMajor) {
      res.status(400).json({
        success: false,
        message: `This endpoint requires ${minimumVersion} or higher`,
        current_version: currentVersion,
        minimum_version: minimumVersion,
      })
      return
    }

    next()
  }
}

export const deprecationMiddleware = (
  sunsetDate: string,
  message: string = 'This endpoint will be removed on the specified date'
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const currentVersion = (req as any).apiVersion || DEFAULT_VERSION

    if (currentVersion === DEFAULT_VERSION) {
      res.set('Deprecation', 'true')
      res.set('Sunset', sunsetDate)
      res.set('Link', `<https://api.example.com${req.path}>; rel="alternate-version"`)

      const acceptHeader = req.get('Accept')
      if (!acceptHeader?.includes('application/vnd.api+json;version=v2')) {
        res.set('Warning', `299 - "Deprecation: ${message}"`)
      }
    }

    next()
  }
}

export const createVersionedResponse = (
  req: Request,
  res: Response,
  responses: Record<string, (req: Request, res: Response) => void>
): void => {
  const version = (req as any).apiVersion || DEFAULT_VERSION

  const handler = responses[version] || responses[DEFAULT_VERSION]

  if (handler) {
    handler(req, res)
  } else {
    res.status(500).json({
      success: false,
      message: 'No response handler configured for this version',
    })
  }
}
