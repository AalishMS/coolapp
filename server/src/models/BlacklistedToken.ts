import mongoose from 'mongoose'

const invalidatedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  invalidatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
})

invalidatedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const InvalidatedToken = mongoose.model('InvalidatedToken', invalidatedTokenSchema)

const TOKEN_BLACKLIST_CACHE = new Set<string>()

export const blacklistToken = async (token: string, expiresIn: string): Promise<void> => {
  const expiresAt = new Date()
  
  switch (expiresIn) {
    case '1h':
      expiresAt.setHours(expiresAt.getHours() + 1)
      break
    case '7d':
      expiresAt.setDate(expiresAt.getDate() + 7)
      break
    default:
      expiresAt.setHours(expiresAt.getHours() + 1)
  }

  TOKEN_BLACKLIST_CACHE.add(token)

  try {
    await InvalidatedToken.create({
      token,
      expiresAt,
    })
  } catch (error) {
    console.error('Error storing blacklisted token in DB:', error)
  }
}

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  if (TOKEN_BLACKLIST_CACHE.has(token)) {
    return true
  }

  try {
    const blacklisted = await InvalidatedToken.findOne({ token })
    if (blacklisted) {
      TOKEN_BLACKLIST_CACHE.add(token)
      return true
    }
  } catch (error) {
    console.error('Error checking blacklisted token:', error)
  }

  return false
}

export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const result = await InvalidatedToken.deleteMany({ expiresAt: { $lt: new Date() } })
    if (result.deletedCount > 0) {
      console.log(`Cleaned up ${result.deletedCount} expired blacklisted tokens`)
    }
    TOKEN_BLACKLIST_CACHE.clear()
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error)
  }
}

export const clearAllBlacklistedTokens = async (): Promise<void> => {
  try {
    await InvalidatedToken.deleteMany({})
    TOKEN_BLACKLIST_CACHE.clear()
  } catch (error) {
    console.error('Error clearing blacklisted tokens:', error)
  }
}

export default InvalidatedToken
