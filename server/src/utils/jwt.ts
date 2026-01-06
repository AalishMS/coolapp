import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

interface TokenPayload {
  id: string
  email: string
}

interface JwtConfig {
  JWT_SECRET: string
  JWT_REFRESH_SECRET: string
  JWT_EXPIRE: string
  JWT_REFRESH_EXPIRE: string
}

const getJwtConfig = (): JwtConfig => {
  const JWT_SECRET = process.env.JWT_SECRET
  const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  const JWT_EXPIRE = process.env.JWT_EXPIRE || '1h'
  const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d'

  if (!JWT_SECRET) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is required. Set it in server/.env file.')
  }

  if (!JWT_REFRESH_SECRET) {
    throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable is required. Set it in server/.env file.')
  }

  if (JWT_SECRET === 'your_super_secret_jwt_key_change_in_production') {
    throw new Error('CRITICAL: JWT_SECRET is using the default placeholder value. Generate a strong random secret for production.')
  }

  if (JWT_REFRESH_SECRET === 'your_super_secret_refresh_key_change_in_production') {
    throw new Error('CRITICAL: JWT_REFRESH_SECRET is using the default placeholder value. Generate a strong random secret for production.')
  }

  return {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRE,
    JWT_REFRESH_EXPIRE,
  }
}

let jwtConfig: JwtConfig | null = null

const getConfig = (): JwtConfig => {
  if (!jwtConfig) {
    jwtConfig = getJwtConfig()
  }
  return jwtConfig
}

export const generateToken = (payload: TokenPayload): string => {
  const config = getConfig()
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRE })
}

export const generateRefreshToken = (payload: TokenPayload): string => {
  const config = getConfig()
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRE })
}

export const verifyToken = (token: string): TokenPayload => {
  const config = getConfig()
  return jwt.verify(token, config.JWT_SECRET) as TokenPayload
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  const config = getConfig()
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenPayload
}

export const validateJwtConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!process.env.JWT_SECRET) {
    errors.push('JWT_SECRET is not set')
  } else if (process.env.JWT_SECRET === 'your_super_secret_jwt_key_change_in_production') {
    errors.push('JWT_SECRET is using the default placeholder value')
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    errors.push('JWT_REFRESH_SECRET is not set')
  } else if (process.env.JWT_REFRESH_SECRET === 'your_super_secret_refresh_key_change_in_production') {
    errors.push('JWT_REFRESH_SECRET is using the default placeholder value')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
