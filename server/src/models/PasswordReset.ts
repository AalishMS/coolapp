import mongoose, { Document, Schema } from 'mongoose'

export interface IPasswordReset extends Document {
  email: string
  token: string
  expiresAt: Date
  usedAt: Date | null
}

const passwordResetSchema = new Schema<IPasswordReset>({
  email: {
    type: String,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  usedAt: {
    type: Date,
    default: null,
  },
})

passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const PasswordReset = mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema)

export default PasswordReset

import crypto from 'crypto'

export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const createPasswordResetToken = async (email: string): Promise<string> => {
  const token = generateResetToken()
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await PasswordReset.findOneAndUpdate(
    { email },
    {
      email,
      token,
      expiresAt,
      usedAt: null,
    },
    { upsert: true, new: true }
  )

  return token
}

export const validateResetToken = async (
  email: string,
  token: string
): Promise<{ valid: boolean; message?: string }> => {
  try {
    const reset = await PasswordReset.findOne({ email, token })

    if (!reset) {
      return { valid: false, message: 'Invalid reset token' }
    }

    if (reset.usedAt) {
      return { valid: false, message: 'Token already used' }
    }

    if (reset.expiresAt < new Date()) {
      return { valid: false, message: 'Token expired' }
    }

    return { valid: true }
  } catch (error) {
    return { valid: false, message: 'Validation failed' }
  }
}

export const markTokenAsUsed = async (email: string, token: string): Promise<void> => {
  await PasswordReset.updateOne(
    { email, token },
    { $set: { usedAt: new Date() } }
  )
}

export const deleteExpiredTokens = async (): Promise<void> => {
  await PasswordReset.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { usedAt: { $ne: null } },
    ],
  })
}
