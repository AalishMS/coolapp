import mongoose, { Document, Schema } from 'mongoose'

export interface ILoginAttempt extends Document {
  email: string
  ip: string
  attempts: number
  lastAttempt: Date
  lockedUntil: Date | null
}

const loginAttemptSchema = new Schema<ILoginAttempt>({
  email: {
    type: String,
    required: true,
    index: true,
  },
  ip: {
    type: String,
    required: true,
    index: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastAttempt: {
    type: Date,
    default: Date.now,
  },
  lockedUntil: {
    type: Date,
    default: null,
  },
})

loginAttemptSchema.index({ email: 1, ip: 1 })

loginAttemptSchema.index({ lockedUntil: 1 }, { expireAfterSeconds: 0 })

const LoginAttempt = mongoose.model<ILoginAttempt>('LoginAttempt', loginAttemptSchema)

export default LoginAttempt

interface LockoutConfig {
  maxAttempts: number
  lockoutDuration: number
  windowMs: number
}

const defaultConfig: LockoutConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
  windowMs: 15 * 60 * 1000,
}

export const checkLockout = async (
  email: string,
  ip: string,
  config: LockoutConfig = defaultConfig
): Promise<{ locked: boolean; remaining?: number; message?: string }> => {
  try {
    const now = Date.now()
    const windowStart = new Date(now - config.windowMs)

    const existingAttempt = await LoginAttempt.findOne({
      $or: [{ email }, { ip }],
      lastAttempt: { $gte: windowStart },
    })

    if (existingAttempt && existingAttempt.lockedUntil && existingAttempt.lockedUntil.getTime() > now) {
      const remaining = Math.ceil((existingAttempt.lockedUntil.getTime() - now) / 1000 / 60)
      return {
        locked: true,
        remaining,
        message: `Account locked. Try again in ${remaining} minutes.`,
      }
    }

    if (existingAttempt && existingAttempt.attempts >= config.maxAttempts) {
      const lockoutEnd = new Date(now + config.lockoutDuration)
      await LoginAttempt.updateOne(
        { _id: existingAttempt._id },
        {
          $set: {
            lockedUntil: lockoutEnd,
            lastAttempt: new Date(),
          },
        }
      )

      return {
        locked: true,
        remaining: config.lockoutDuration / 1000 / 60,
        message: `Too many failed attempts. Account locked for ${config.lockoutDuration / 1000 / 60} minutes.`,
      }
    }

    return { locked: false }
  } catch (error) {
    console.error('Lockout check error:', error)
    return { locked: false }
  }
}

export const recordFailedAttempt = async (
  email: string,
  ip: string,
  config: LockoutConfig = defaultConfig
): Promise<void> => {
  try {
    const now = Date.now()
    const windowStart = new Date(now - config.windowMs)

    await LoginAttempt.findOneAndUpdate(
      { $or: [{ email }, { ip }], lastAttempt: { $gte: windowStart } },
      {
        $inc: { attempts: 1 },
        $set: { lastAttempt: new Date() },
      },
      { upsert: true, new: true }
    )
  } catch (error) {
    console.error('Failed to record login attempt:', error)
  }
}

export const recordSuccessfulAttempt = async (
  email: string,
  ip: string
): Promise<void> => {
  try {
    await LoginAttempt.deleteMany({ $or: [{ email }, { ip }] })
  } catch (error) {
    console.error('Failed to clear login attempts:', error)
  }
}

export const resetLockout = async (email: string): Promise<void> => {
  try {
    await LoginAttempt.deleteMany({ email })
  } catch (error) {
    console.error('Failed to reset lockout:', error)
  }
}
