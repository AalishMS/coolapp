import crypto from 'crypto'

const CSRF_TOKEN_HEADER = 'x-csrf-token'
const CSRF_COOKIE_NAME = 'csrf_token'
const CSRF_TOKEN_SIZE = 32

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(CSRF_TOKEN_SIZE).toString('hex')
}

export const createCsrfTokenPair = (): { token: string; tokenHash: string } => {
  const token = generateCsrfToken()
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, tokenHash }
}

export const verifyCsrfToken = (token: string, tokenHash: string): boolean => {
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(tokenHash))
}

interface CsrfCookies {
  csrfToken: string
  csrfTokenHash: string
}

export const setCsrfCookies = (
  res: import('express').Response,
  token: string,
  tokenHash: string
): void => {
  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  })

  res.cookie('csrf_token_hash', tokenHash, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  })
}

export const clearCsrfCookies = (res: import('express').Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, { path: '/' })
  res.clearCookie('csrf_token_hash', { path: '/' })
}

export const extractCsrfToken = (req: import('express').Request): string | undefined => {
  return req.cookies[CSRF_COOKIE_NAME] || req.headers[CSRF_TOKEN_HEADER] as string | undefined
}

export const validateCsrf = (
  req: import('express').Request,
  res: import('express').Response,
  next: import('express').NextFunction
): void => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method)) {
    next()
    return
  }

  const cookieToken = req.cookies[CSRF_COOKIE_NAME]
  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string | undefined

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    })
    return
  }

  try {
    const cookieTokenHash = crypto
      .createHash('sha256')
      .update(cookieToken)
      .digest('hex')

    const expectedHeaderHash = crypto
      .createHash('sha256')
      .update(headerToken)
      .digest('hex')

    if (
      !crypto.timingSafeEqual(
        Buffer.from(cookieTokenHash),
        Buffer.from(expectedHeaderHash)
      )
    ) {
      res.status(403).json({
        success: false,
        message: 'Invalid CSRF token',
      })
      return
    }

    next()
  } catch {
    res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    })
  }
}

export { CSRF_TOKEN_HEADER, CSRF_COOKIE_NAME }
